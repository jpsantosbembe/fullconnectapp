import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Animated } from 'react-native';
import { Card, Text, useTheme, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Router } from '../../../models/Router';
import { RootStackParamList } from '../../../navigation/AppNavigator';

type RouterDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RouterDetail'>;

interface RouterCardProps {
    router: Router;
}

const RouterCard: React.FC<RouterCardProps> = ({ router }) => {
    const theme = useTheme();
    const navigation = useNavigation<RouterDetailNavigationProp>();

    // Referência para a animação de pulso do halo
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;

    // Obter o primeiro provider (se houver)
    const primaryProvider = router.providers && router.providers.length > 0
        ? router.providers[0]
        : null;

    // Status geral (ativo se pelo menos um provider estiver ativo)
    const isActive = router.providers && router.providers.some(provider => provider.status);

    // Criar animação de pulso para o halo
    useEffect(() => {
        // Criar animação pulsante para o halo ao redor do indicador
        // Agora funciona para ambos os status (ativo ou inativo)
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.8,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(opacityAnim, {
                        toValue: 0.2,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.6,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        ).start();
    }, []);

    const handlePress = () => {
        navigation.navigate('RouterDetail', { routerId: router.id });
    };

    // Gerar um tempo fictício (em uma aplicação real, isso viria da API)
    const getRandomTime = () => {
        const days = Math.floor(Math.random() * 10);
        const hours = Math.floor(Math.random() * 24);
        const mins = Math.floor(Math.random() * 60);
        return `${days}d ${hours}h ${mins}min`;
    };

    return (
        <Card
            style={styles.card}
            mode="elevated"
            onPress={handlePress}
        >
            <Card.Content style={styles.cardContent}>
                {/* Primeira linha: Link, imagem e status */}
                <View style={styles.firstRow}>
                    {/* Lado esquerdo: "Link" e imagem */}
                    <View style={styles.linkContainer}>
                        <Text variant="titleMedium" style={styles.linkText}>Link</Text>
                        {primaryProvider && primaryProvider.logoUrl ? (
                            <Image
                                source={{ uri: primaryProvider.logoUrl }}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        ) : (
                            <Avatar.Icon
                                size={24}
                                icon="link-variant"
                                style={{ backgroundColor: theme.colors.primary }}
                            />
                        )}
                    </View>

                    {/* Indicador de Status - com animação de halo */}
                    <View style={styles.statusContainer}>
                        <Animated.View
                            style={[
                                styles.halo,
                                {
                                    backgroundColor: isActive ? '#4CAF50' : '#F44336',
                                    transform: [{ scale: pulseAnim }],
                                    opacity: opacityAnim
                                }
                            ]}
                        />
                        <View
                            style={[
                                styles.statusIndicator,
                                { backgroundColor: isActive ? '#4CAF50' : '#F44336' }
                            ]}
                        />
                    </View>
                </View>

                {/* Segunda linha: Tempo */}
                <View style={styles.timeContainer}>
                    <Text variant="bodyMedium" style={styles.timeText}>
                        {getRandomTime()}
                    </Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Terceira linha: Seta */}
                <View style={styles.arrowContainer}>
                    <Text style={[styles.arrow, { color: theme.colors.primary }]}>→</Text>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 8,
        flex: 1,
        maxWidth: '47%',
        height: 140,
    },
    cardContent: {
        height: '100%',
        padding: 10,
    },
    firstRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkText: {
        fontWeight: 'bold',
        marginRight: 8,
    },
    logo: {
        width: 24,
        height: 24,
        borderRadius: 4,
    },
    statusContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
    },
    // Indicador de status fixo
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#fff',
        position: 'absolute',
        zIndex: 2,
    },
    // Halo animado ao redor do indicador
    halo: {
        width: 10,
        height: 10,
        borderRadius: 5,
        position: 'absolute',
        zIndex: 1,
    },
    timeContainer: {
        marginVertical: 10,
    },
    timeText: {
        color: '#777',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    arrowContainer: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    arrow: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default RouterCard;