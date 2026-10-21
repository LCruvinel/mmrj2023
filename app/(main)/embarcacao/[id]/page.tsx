"use client";

import { use, useEffect, useState } from "react";

export default function Page(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  //pedir ao zé para fazer o fetch da embarcação com o id = params.id
  const [personData, setPersonData] = useState<Embarcacao>();
  useEffect(() => {
    fetch(`/api/pessoa/read/embarcacao_pessoa?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPersonData(data);
      });
  }, [params.id]);

  return (
    <main className="flex p-4 mx-10 mt-5 border-2 border-gray-300 border-solid shadow-lg rounded-3xl md:mx-24 ">
      <table className="w-full p-10 text-left border border-separate table-auto rounded-xl border-spacing-y-2 ">
        <thead className="p-1 text-xs uppercase bg-blue-200 rounded-xl">
          <tr>
            <th className="p-2 rounded-l-lg">Embarcação</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody className="">
          {/* {personData?.map((row, index) => (
            <tr
              key={index}
              className='text-xs cursor-pointer  hover:bg-blue-200 hover:bg-opacity-30'
              // onClick={() => router.push(`/embarcacao/${row.id}`)}
            >
              <td className='p-2 rounded-l-lg '>{row.nome}</td>
              <td className='p-2 rounded-r-lg'>
                {row.relacao_embarcacao_proprietario[0].pessoa.nome}
              </td>
            </tr>
          ))} */}
        </tbody>
      </table>
    </main>
  );

  return <div>My Post: {params.id}</div>;
}
