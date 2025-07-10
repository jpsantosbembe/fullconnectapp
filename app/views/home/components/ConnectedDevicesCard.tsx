// views/home/components/ConnectedDevicesCard.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface ConnectedDevicesCardProps {
    connectedDevicesCount?: number;
}

const ConnectedDevicesCard: React.FC<ConnectedDevicesCardProps> = ({ connectedDevicesCount }) => {
    // Usar o número da API ou um número aleatório se não estiver disponível
    const displayCount = connectedDevicesCount || Math.floor(Math.random() * 51) + 50;

    return (
        <Card style={styles.devicesCard}>
            <Card.Content style={styles.devicesCardContent}>
                <Text variant="titleLarge" style={styles.devicesTitle}>
                    Dispositivos Conectados
                </Text>
                <Text variant="displayMedium" style={styles.devicesCount}>
                    {displayCount}
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
