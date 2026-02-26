import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-100 border-t mt-8 py-4">
            <div className="container mx-auto px-4 text-center text-gray-600 text-xs">
                <p>© {new Date().getFullYear()} Банк для Монополии. Все права защищены.</p>
                <p className="mt-2">
                    <Link href="/about" className="text-blue-500 hover:underline">
                        О приложении
                    </Link>
                </p>
            </div>
        </footer>
    );
}