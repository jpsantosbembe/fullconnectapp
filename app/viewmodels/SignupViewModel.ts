// fullconnect/app/viewmodels/SignupViewModel.ts (Modified)
import { useState } from 'react';
import { AuthService } from '../services/AuthService';

export const useSignupViewModel = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const validateForm = (): { valid: boolean; errors: { [key: string]: string } } => {
        const errors: { [key: string]: string } = {};

        if (!name.trim()) {
            errors.name = 'O nome é obrigatório';
        }

        if (!email.trim()) {
            errors.email = 'O email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Email inválido';
        }

        if (!password) {
            errors.password = 'A senha é obrigatória';
        } else if (password.length < 8) {
            errors.password = 'A senha deve ter pelo menos 8 caracteres';
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = 'As senhas não correspondem';
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors,
        };
    };

    const signup = async () => {
        setError(null);
        setSuccess(false);

        const { valid, errors } = validateForm();
        if (!valid) {
            const firstError = Object.values(errors)[0];
            setError(firstError);
            return { success: false, error: firstError };
        }

        setLoading(true);

        try {
            const userData = {
                name,
                email,
                password,
            };

            const result = await AuthService.signup(userData);
            setSuccess(true);
            return { success: true };
        } catch (error: any) {
            if (error instanceof Error) {
                setError(error.message);
                return { success: false, error: error.message };
            }
            const genericError = 'Ocorreu um erro durante o cadastro';
            setError(genericError);
            return { success: false, error: genericError };
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError(null);
        setSuccess(false);
    };

    return {
        name,
        setName,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        loading,
        error,
        success,
        signup,
        clearForm,
        validateForm,
    };
};

const SignupViewModelComponent = () => null;

export default SignupViewModelComponent;