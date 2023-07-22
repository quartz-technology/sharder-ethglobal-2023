import React from "react";
import {AppBar, Button, Divider, Stack, Toolbar, Typography} from "@mui/material";
import { useSignIn } from "@walletconnect/modal-auth-react";
import { JsonRpcProvider } from "ethers";
import {useSharderContext} from "../hooks/context/SharderContext";

export default function TopAppBar(): JSX.Element {
    const { setProvider} = useSharderContext();
    const { signIn, data, error,  } = useSignIn({ statement: 'Connect to my dapp', aud: process.env.REACT_APP_WALLET_CONNECT_DOMAIN })

    async function onSignIn() {
        await signIn();

        if (!error) {
            setProvider(new JsonRpcProvider(
                `https://rpc.walletconnect.com/v1/?chainId=eip155:1&projectId=${process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID}`
            ));
        }
    }

    return (
        <AppBar
            sx={{ width: "100vw" }}
            position={"static"}
            elevation={0}
            color={"transparent"}
            component="nav"
        >
            <Toolbar>
                <Stack flexGrow={1} alignItems={"center"}>
                    <Typography variant={"h6"} fontWeight={"bold"}>
                            Sharder
                    </Typography>
                </Stack>
                {
                    data?.address ?
                        (<>
                            ⌐◒-◒
                        </>)
                        :
                        (<Button onClick={onSignIn}>
                            Connect
                        </Button>)
                }
            </Toolbar>
            <Divider />
        </AppBar>
    );
}