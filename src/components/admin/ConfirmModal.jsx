import React from 'react';

const ConfirmModal = ({ open, title = 'Confirmar', message, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onCancel}></div>
      <div className="bg-white rounded-lg shadow-lg z-80 max-w-lg w-full">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-700 mb-4">{message}</p>
          <div className="flex justify-end space-x-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-100">Cancelar</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white">Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
