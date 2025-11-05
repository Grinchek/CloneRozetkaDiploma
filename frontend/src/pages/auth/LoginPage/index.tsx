import { useGoogleLogin } from '@react-oauth/google';

const LoginPage = ()=>{
    const loginUseGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) =>
        {
            console.log("tokenResponse GOOGLE", tokenResponse.access_token);
            try {
                //await loginByGoogle(tokenResponse.access_token).unwrap();
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