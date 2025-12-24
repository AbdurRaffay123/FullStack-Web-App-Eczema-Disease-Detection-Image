import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomModal, { ModalType, ModalButton } from '@/components/CustomModal';

interface ModalState {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  buttons?: ModalButton[];
}

interface ModalContextType {
  showModal: (
    type: ModalType,
    title: string,
    message: string,
    buttons?: ModalButton[]
  ) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showModal = (
    type: ModalType,
    title: string,
    message: string,
    buttons?: ModalButton[]
  ) => {
    setModalState({
      visible: true,
      type,
      title,
      message,
      buttons,
    });
  };

  const hideModal = () => {
    setModalState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <CustomModal
        visible={modalState.visible}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        buttons={modalState.buttons}
        onClose={hideModal}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

// Convenience functions for common modal types
export function useModalHelpers() {
  const { showModal, hideModal } = useModal();

  const showSuccess = (message: string, title: string = 'Success', onOk?: () => void) => {
    showModal('success', title, message, [
      {
        text: 'OK',
        onPress: onOk || (() => {}),
      },
    ]);
  };

  const showError = (message: string, title: string = 'Error', onOk?: () => void) => {
    showModal('error', title, message, [
      {
        text: 'OK',
        onPress: onOk || (() => {}),
      },
    ]);
  };

  const showInfo = (message: string, title: string = 'Info', onOk?: () => void) => {
    showModal('info', title, message, [
      {
        text: 'OK',
        onPress: onOk || (() => {}),
      },
    ]);
  };

  const showWarning = (message: string, title: string = 'Warning', onOk?: () => void) => {
    showModal('warning', title, message, [
      {
        text: 'OK',
        onPress: onOk || (() => {}),
      },
    ]);
  };

  const showConfirm = (
    message: string,
    title: string = 'Confirm',
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showModal('confirm', title, message, [
      {
        text: 'Cancel',
        onPress: onCancel || (() => {}),
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: onConfirm,
        style: 'default',
      },
    ]);
  };

  return {
    showModal,
    hideModal,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
  };
}

