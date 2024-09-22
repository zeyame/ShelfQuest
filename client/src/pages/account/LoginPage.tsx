import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import '../../styles/login-page.css';
import { LoginForm } from "../../components/Login-Page/LoginForm";
import { LoginError } from "../../interfaces/LoginError";
import { loginUser } from "../../services/userAccount";
import { handleKeyDown } from "../../utils/handleKeyDown";


export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // successfull registration message 
    const registeredMessage: string | null = location.state?.registeredMessage;

    // user details from the registration process 
    const registeredUsername: string | null = location.state?.userLoginDetails.username;
    const registeredPassword: string | null = location.state?.userLoginDetails.password;
    
    const [userLogin, setUserLogin] = useState<UserLogin>({
        username: registeredUsername || '',
        password: registeredPassword || '',
    });
    
    const [loginError, setLoginError] = useState<LoginError>({
        usernameError: '',
        passwordError: ''
    });

    const [loading, setLoading] = useState<boolean>(false);

    
    const handleLoginField = (inputFieldName: string, inputValue: string) => {
        const adjustedInputFieldName: string = inputFieldName.replace(/\s+/g, '').toLowerCase();

        if (adjustedInputFieldName in userLogin) {
            setUserLogin(prev => ({
                ...prev,
                [adjustedInputFieldName]: inputValue
            }));
        }
    }

    const handleLoginButton = async () => {
        setLoginError({
            usernameError: '',
            passwordError: ''
        });

        const formHasErrors: boolean = checkFormValidity();

        if (!formHasErrors) {
            try {
                setLoading(true);
                await loginUser(userLogin.username, userLogin.password);
                navigate(`/user/${userLogin.username}/read`);
            }
            catch (error: any) {
                // error set to password always to be displayed right below the password field
                setLoginError(prev => ({
                    ...prev,
                    passwordError: error.message
                }));
            }
            finally {
                setLoading(false);
            }
        }
    }

    const checkFormValidity = (): boolean => {
        let hasErrors = false;

        if (userLogin.username.length < 1) {
            setLoginError(prev => ({
                ...prev,
                usernameError: 'Username is required.'
            }));
            hasErrors = true;
        }

        if (userLogin.password.length < 1) {
            setLoginError(prev => ({
                ...prev,
                passwordError: 'Password is required.'
            }));
            hasErrors = true;
        }

        return hasErrors;
    }

    const handleSignUpButton = () => {
        navigate("/user/registration")
    }

    return (
        <div className="login-page-container">
            {
                registeredMessage &&
                <div className="successful-verification-message">
                    {registeredMessage}
                </div>
            }
            <h1 className="login-page-app-name">Shelf Quest</h1>
            <LoginForm userLogin={userLogin} handleLoginField={handleLoginField} handleLoginButton={handleLoginButton} handleKeyDown={handleKeyDown} handleSignUpButton={handleSignUpButton} loading={loading} loginError={loginError} />
        </div>
    );
}