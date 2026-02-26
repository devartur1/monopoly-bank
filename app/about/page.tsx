import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-4">О приложении «Банк для Монополии»</h1>
            <p className="mb-4">
                Это приложение создано для упрощения игры в монополию. Оно заменяет банкира и позволяет игрокам самостоятельно переводить деньги друг другу, а также брать деньги из банка (только для создателя игры). Все транзакции записываются в историю.
            </p>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Как это работает</h2>
            <ul className="list-disc pl-5 mb-4">
                <li>Создатель игры задаёт стартовый баланс игроков и получает ссылку для приглашения.</li>
                <li>Игроки переходят по ссылке, вводят своё имя и попадают в игру.</li>
                <li>На главной странице отображаются балансы всех игроков и банка.</li>
                <li>Чтобы перевести деньги, нажмите на карточку другого игрока (кроме себя) или банка — откроется цифровая клавиатура.</li>
                <li>Создатель игры видит зелёную кнопку 💰 рядом с каждым игроком — она позволяет выдать деньги из банка.</li>
                <li>История всех переводов доступна на вкладке «История».</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-2">Контакты</h2>
            <p className="mb-4">
                По всем вопросам пишите на email:{' '}
                <a href="mailto:artur@me.com" className="text-blue-500 hover:underline">
                    artur@me.com
                </a>
            </p>

            <div className="mt-6">
                <Link href="/" className="text-blue-500 hover:underline">
                    ← Вернуться к игре
                </Link>
            </div>
        </div>
    );
}