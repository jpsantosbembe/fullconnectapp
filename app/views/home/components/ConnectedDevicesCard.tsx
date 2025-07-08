import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

const ConnectedDevicesCard: React.FC = () => {
    // Estado para número aleatório de dispositivos (gerado apenas uma vez)
    const [connectedDevices] = useState(
        Math.floor(Math.random() * 51) + 50 // Número entre 50 e 100
    );

    return (
        <Card style={styles.devicesCard}>
            <Card.Content style={styles.devicesCardContent}>
                <Text variant="titleLarge" style={styles.devicesTitle}>
                    Dispositivos Conectados
                </Text>
                <Text variant="displayMedium" style={styles.devicesCount}>
                    {connectedDevices}
                </Text>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    devicesCard: {
        margin: 8,
        marginTop: 16,
    },
    devicesCardContent: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    devicesTitle: {
        marginBottom: 16,
    },
    devicesCount: {
        fontWeight: 'bold',
        color: '#3578E5',
    }
});

export default ConnectedDevicesCard;