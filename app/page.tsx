import Link from 'next/link';

export default function Home() {
  return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Банк для Монополии</h1>
        <Link href="/create" className="bg-blue-500 text-white px-6 py-3 rounded">
          Создать новую игру
        </Link>
      </div>
  );
}