// components/TransferDialog.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface Props {
  onConfirm: (amount: number) => void;
  onClose: () => void;
}

export default function TransferDialog({ onConfirm, onClose }: Props) {
  const t = useTranslations("GamePage");
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num > 0) {
      onConfirm(num);
    } else {
      alert(t("invalidAmount"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm">
        <form onSubmit={handleSubmit} className="p-4">
          <h3 className="text-lg font-semibold mb-2">{t("enterAmount")}</h3>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full border p-2 rounded mb-4"
            placeholder={t("amount")}
            min="1"
            step="1"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white p-2 rounded"
            >
              {t("transfer")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-400 text-white p-2 rounded"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
