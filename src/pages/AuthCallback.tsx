import {useEffect} from "react";

import {useNavigate} from "react-router";

import {useAuth} from "@uva-fnwi/datanose-core";
import type {CustomUserState} from "@uva-fnwi/datanose-core";

function AuthCallback() {
    const {surfCompleteLogin} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        surfCompleteLogin()
            .then((user) => {
                const state = user.state as CustomUserState;
                navigate(state?.redirectUrl ?? "/", {replace: true});
            })
            .catch(() => {
                navigate("/", {replace: true});
            });
    }, [surfCompleteLogin, navigate]);

    return null;
}

export default AuthCallback;
