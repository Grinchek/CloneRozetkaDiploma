import { useGoogleLogin } from '@react-oauth/google';
import {useLoginByGoogleMutation} from "../../../features/account/apiAccount.ts";

const LoginPage = ()=>{
    const [loginByGoogle] = useLoginByGoogleMutation();
    const loginUseGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) =>
        {
            console.log("tokenResponse GOOGLE", tokenResponse.access_token);
            try {
                const result = await loginByGoogle(
                    {
                        token: tokenResponse.access_token
                    }).unwrap();
                console.log("login result", result);
                // dispatch(loginSuccess(result.token));
                //navigate('/');
            } catch (error) {

                console.log("User server error auth", error);
                // const serverError = error as ServerError;
                //
                // if (serverError?.status === 400 && serverError?.data?.errors) {
                //     // setServerErrors(serverError.data.errors);
                // } else {
                //     message.error("Сталася помилка при вході");
                // }
            }
        },
    });
    return (
        <>
            <button
                onClick={(event) => {
                    event.preventDefault();
                    loginUseGoogle();
                }}

            >
                {'LoginGoogle'}
            </button>
        </>
    )
}
export default LoginPage;