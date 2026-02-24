'use client';

import React from 'react';

interface Props {
    value: number;
    onChange: (value: number) => void;
    onConfirm: () => void;
    onClose: () => void;
}

export default function DigitalKeyboard({ value, onChange, onConfirm, onClose }: Props) {
    const handleNumber = (num: number) => onChange(value * 10 + num);
    const handleBackspace = () => onChange(Math.floor(value / 10));
    const handleClear = () => onChange(0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center">
            <div className="bg-white w-full max-w-md rounded-t-xl p-4">
                <div className="text-right text-3xl font-mono mb-4 p-2 border">{value}</div>
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button key={num} className="p-4 bg-gray-200 rounded" onClick={() => handleNumber(num)}>
                            {num}
                        </button>
                    ))}
                    <button className="p-4 bg-gray-200 rounded" onClick={() => handleNumber(0)}>0</button>
                    <button className="p-4 bg-red-200 rounded" onClick={handleClear}>C</button>
                    <button className="p-4 bg-blue-200 rounded" onClick={handleBackspace}>⌫</button>
                </div>
                <div className="flex mt-4">
                    <button className="flex-1 p-4 bg-green-500 text-white rounded mr-2" onClick={onConfirm}>
                        Подтвердить
                    </button>
                    <button className="flex-1 p-4 bg-gray-400 text-white rounded" onClick={onClose}>
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
}