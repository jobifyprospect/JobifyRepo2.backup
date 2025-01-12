import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet } from 'react-native';
import DynamicButton from './DynamicButton';

interface BioInputDialogProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (bio: string) => void;
}

const BioInputDialog: React.FC<BioInputDialogProps> = ({ isVisible, onClose, onSave }) => {
    const [bio, setBio] = useState('');

    return (
        <Modal visible={isVisible} transparent animationType="fade" >
            <View style={styles.modalContainer}>
                <View style={styles.dialogContainer}>
                    <Text style={styles.title}> Create Your Bio </Text>
                    < TextInput
                        style={styles.input}
                        multiline
                        maxLength={150}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Enter your bio (max 150 characters)"
                    />
                    <Text style={styles.charCount}> {bio.length} / 150 </Text>
                    < View style={styles.buttonContainer} >
                        <DynamicButton title="Cancel" onPress={onClose} type="secondary" />
                        <DynamicButton title="Save" onPress={() => onSave(bio)} type="primary" />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dialogContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        alignSelf: 'flex-end',
        marginTop: 5,
        color: '#888',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
});

export default BioInputDialog;