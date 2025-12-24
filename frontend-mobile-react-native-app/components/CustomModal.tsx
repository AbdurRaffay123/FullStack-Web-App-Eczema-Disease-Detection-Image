import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  X,
} from 'lucide-react-native';

export type ModalType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

export interface ModalButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomModalProps {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  buttons?: ModalButton[];
  onClose: () => void;
}

export default function CustomModal({
  visible,
  type,
  title,
  message,
  buttons,
  onClose,
}: CustomModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={48} color="#28A745" />;
      case 'error':
        return <XCircle size={48} color="#DC3545" />;
      case 'warning':
        return <AlertCircle size={48} color="#FFA500" />;
      case 'confirm':
        return <AlertCircle size={48} color="#6A9FB5" />;
      default:
        return <Info size={48} color="#6A9FB5" />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#28A745';
      case 'error':
        return '#DC3545';
      case 'warning':
        return '#FFA500';
      case 'confirm':
        return '#6A9FB5';
      default:
        return '#6A9FB5';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(40, 167, 69, 0.1)';
      case 'error':
        return 'rgba(220, 53, 69, 0.1)';
      case 'warning':
        return 'rgba(255, 165, 0, 0.1)';
      case 'confirm':
        return 'rgba(106, 159, 181, 0.1)';
      default:
        return 'rgba(106, 159, 181, 0.1)';
    }
  };

  const defaultButtons: ModalButton[] = buttons || [
    {
      text: 'OK',
      onPress: onClose,
      style: 'default',
    },
  ];

  const handleButtonPress = (button: ModalButton) => {
    button.onPress();
    if (button.style !== 'cancel') {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1A1A2E', '#16213E', '#0F3460']}
            style={styles.modalContent}
          >
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: getBackgroundColor() }]}>
              {getIcon()}
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {defaultButtons.map((button, index) => {
                const isCancel = button.style === 'cancel';
                const isDestructive = button.style === 'destructive';
                const isLast = index === defaultButtons.length - 1;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      isCancel && styles.cancelButton,
                      isDestructive && styles.destructiveButton,
                      !isLast && styles.buttonMargin,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        isCancel && styles.cancelButtonText,
                        isDestructive && styles.destructiveButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#6A9FB5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  destructiveButton: {
    backgroundColor: '#DC3545',
  },
  buttonMargin: {
    marginRight: 0,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#B0B0B0',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
  },
});

