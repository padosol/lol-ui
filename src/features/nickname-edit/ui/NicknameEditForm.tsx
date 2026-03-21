"use client";

import { useState } from "react";
import { useNicknameEdit } from "../model/useNicknameEdit";

interface NicknameEditFormProps {
  currentNickname: string;
}

export default function NicknameEditForm({
  currentNickname,
}: NicknameEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentNickname);
  const { updateNickname, isPending, error, setError, validate } =
    useNicknameEdit();

  function handleEdit() {
    setValue(currentNickname);
    setError(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setValue(currentNickname);
    setError(null);
    setIsEditing(false);
  }

  function handleSave() {
    const validationError = validate(value);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (value.trim() === currentNickname) {
      setIsEditing(false);
      return;
    }
    updateNickname(value.trim(), {
      onSuccess: () => setIsEditing(false),
    });
  }

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-on-surface">{currentNickname}</span>
        <button
          type="button"
          onClick={handleEdit}
          className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        >
          수정
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={16}
          className="flex-1 px-3 py-2 bg-surface-4 border border-divider rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-4 py-2 bg-primary text-on-surface rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="px-4 py-2 bg-surface-4 text-on-surface-medium rounded-lg text-sm font-medium hover:bg-surface-2 transition-colors disabled:opacity-50"
        >
          취소
        </button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
