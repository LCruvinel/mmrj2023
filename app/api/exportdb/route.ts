import { Client } from 'pg';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { validateRequest } from '@/auth';
import { NextRequest } from 'next/server';
import dayjs from 'dayjs';

export async function GET(req: NextRequest) {
  const { user } = await validateRequest();

  if (!user || user.role != 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  const client = new Client({
    user: process.env.DB_USER ?? 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    database: process.env.DB_NAME ?? 'proj_fapesp',
    password: process.env.DB_PASSWORD ?? '',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl: {
      rejectUnauthorized: false, // Accept self-signed certificates
    },
  });

  try {
    await client.connect();

    const passThrough = new PassThrough();
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      throw err;
    });

    const readableStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => controller.enqueue(chunk));
        passThrough.on('end', () => controller.close());
        passThrough.on('error', (err) => controller.error(err));
      },
      cancel() {
        passThrough.destroy();
      },
    });

    const response = new Response(readableStream, {
      headers: {
        'Content-Disposition': 'attachment; filename=backup.zip',
        'Content-Type': 'application/zip',
      },
    });

    archive.pipe(passThrough);

    const tablesResult = await client.query(
      "SELECT schemaname, tablename FROM pg_tables WHERE schemaname IN ('auth', 'mmrj') ORDER BY schemaname, tablename"
    );

    const tables = tablesResult.rows.map((row) => ({
      schemaName: row.schemaname,
      tableName: row.tablename,
    }));

    for (const { schemaName, tableName } of tables) {
      try {
        // Fetch the schema of the table
        const tableSchemaResult = await client.query(`
          SELECT column_name, data_type, character_maximum_length
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE table_schema = '${schemaName}' AND table_name = '${tableName}';
        `);

        let tableSQL = `-- Table: ${schemaName}.${tableName}\n\n`;
        tableSQL += `CREATE TABLE ${schemaName}.${tableName} (\n`;
        tableSQL += tableSchemaResult.rows
          .map((column) => {
            return `  ${column.column_name} ${column.data_type}${
              column.character_maximum_length
                ? `(${column.character_maximum_length})`
                : ''
            }`;
          })
          .join(',\n');
        tableSQL += `\n);\n\n`;

        // Fetch the data of the table
        const tableDataResult = await client.query(
          `SELECT * FROM ${schemaName}.${tableName}`
        );
        const rows = tableDataResult.rows;

        // Generate INSERT statements for the table data
        const insertStatements =
          rows
            .map((row) => {
              const columns = Object.keys(row).join(', ');
              const values = Object.values(row)
                .map((value) => {
                  if (typeof value === 'string') {
                    return `'${value.replace(/'/g, "''")}'`;
                  } else if (value instanceof Date) {
                    return "'" + dayjs(value).format('DD-MM-YYYY') + "'";
                  } else if (value === null) {
                    return 'NULL';
                  } else {
                    return value;
                  }
                })
                .join(', ');
              return `INSERT INTO ${schemaName}.${tableName} (${columns}) VALUES (${values});`;
            })
            .join('\n') + '\n';

        // Combine table schema and data into a single SQL file
        tableSQL += insertStatements;

        // Add the combined SQL file to the archive
        archive.append(tableSQL, { name: `${tableName}.sql` });
      } catch (error) {
        console.error(`Error querying table ${tableName}:`, error);
        // Skip this table if there is an error
      }
    }

    await archive.finalize();
    return response;
  } catch (error) {
    console.error('Error generating backup:', error);
    return new Response('Error generating backup', { status: 500 });
  } finally {
    await client.end();
  }
}
