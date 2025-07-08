import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Text, Button, useTheme, Appbar } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type RouterDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RouterDetail'>;
type RouterDetailRouteProp = RouteProp<RootStackParamList, 'RouterDetail'>;

const RouterDetailScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<RouterDetailNavigationProp>();
    const route = useRoute<RouterDetailRouteProp>();

    const { routerId } = route.params;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="auto" />

            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Detalhes do Router" />
            </Appbar.Header>

            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>
                        Detalhes do Router ID: {routerId}
                    </Text>

                    <Button
                        mode="contained"
                        onPress={() => navigation.goBack()}
                        style={styles.button}
                    >
                        Voltar para o Dashboard
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    button: {
        marginTop: 16,
        paddingVertical: 6,
    },
});

export default RouterDetailScreen;