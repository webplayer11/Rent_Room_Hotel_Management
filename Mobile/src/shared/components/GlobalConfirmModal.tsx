import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';

export type CustomAlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

let showGlobalAlert: (title: string, message?: string, buttons?: CustomAlertButton[]) => void;

export const CustomAlert = {
  alert: (title: string, message?: string, buttons?: CustomAlertButton[]) => {
    if (showGlobalAlert) {
      showGlobalAlert(title, message, buttons);
    } else {
      console.warn('GlobalConfirmModal is not mounted');
    }
  }
};

export const GlobalConfirmModal = () => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<{title: string, message?: string, buttons?: CustomAlertButton[]}>({ title: '' });

  useEffect(() => {
    showGlobalAlert = (title, message, buttons) => {
      setConfig({ title, message, buttons });
      setVisible(true);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null;

  const buttons = config.buttons || [{ text: 'OK', onPress: () => {} }];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.container}>
          <Text style={styles.title}>{config.title}</Text>
          {!!config.message && <Text style={styles.message}>{config.message}</Text>}
          
          <View style={styles.buttonContainer}>
            {buttons.map((btn, index) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.button, 
                    isCancel ? styles.cancelButton : null,
                    isDestructive ? styles.destructiveButton : null
                  ]}
                  onPress={() => {
                    handleClose();
                    if (btn.onPress) btn.onPress();
                  }}
                >
                  <Text style={[
                    styles.buttonText,
                    isCancel ? styles.cancelText : null,
                    isDestructive ? styles.destructiveText : null
                  ]}>
                    {btn.text || 'OK'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#5392F9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cancelText: {
    color: '#4B5563',
  },
  destructiveText: {
    color: '#FFF',
  },
});
