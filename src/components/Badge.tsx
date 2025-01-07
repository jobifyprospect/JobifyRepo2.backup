import React, { useState } from 'react';
import { View, Image, Text, ImageSourcePropType, StyleSheet, TouchableOpacity, Modal } from "react-native"
import { BadgeType } from '../services/interfaces/badge';

type BadgeInfoType = {
    image: ImageSourcePropType;
    description: string;
};

type BadgeImagesType = {
    [key in BadgeType]: BadgeInfoType;
};

export default function Badge({ img }: { img: BadgeType }) {
    const [modalVisible, setModalVisible] = useState(false);
    if (!img) {
        return null;
    }

    const badgeInfo: BadgeImagesType = {
        'verified': {
            image: require('../assets/badges/badge-verified.png'),
            description: "This worker has been verified by the Jobify team."
        },
        'laundry': {
            image: require('../assets/badges/badge-laundry.png'),
            description: "This worker has successfully passed the launderer assessment."
        },
        'woodworker': {
            image: require('../assets/badges/badge-woodworker.png'),
            description: "This worker has successfully passed the woodworker assessment."
        },
        'firstjob': {
            image: require('../assets/badges/badge-1job.png'),
            description: "Congratulations on completing your first job!"
        },
        '5jobs': {
            image: require('../assets/badges/badge-5jobs.png'),
            description: "You've completed 5 jobs. Keep up the great work!"
        },
    };

    return (
        <View>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image
                    source={badgeInfo[img].image}
                    style={styles.image}
                />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Image
                            source={badgeInfo[img].image}
                            style={styles.modalImage}
                        />
                        <Text style={styles.modalText}>{badgeInfo[img].description}</Text>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    image: {
        width: 40,
        height: 40,
        borderRadius: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginBottom: 10,
    },
    modalText: {
        textAlign: 'center',
        fontSize: 16,
    },
});
