import React from "react";
import {
    AppBar,
    Box,
    Button,
    Divider,
    IconButton,
    Link,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Modal,
    Paper,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import {ethers} from "ethers";
import {useSharderContext} from "../hooks/context/SharderContext";
import {MetaMaskSDK} from "@metamask/sdk";
import {Client, Conversation, DecodedMessage} from "@xmtp/xmtp-js";
import ForumIcon from '@mui/icons-material/Forum';
import DraftsIcon from '@mui/icons-material/Drafts';

export default function TopAppBar(): JSX.Element {
    const { setProvider} = useSharderContext();
    const [conversations, setConversations] = React.useState<Conversation[]>([]);
    const [isConnected, setIsConnected] = React.useState<boolean>(false);
    const [renderConversations, setRenderConversations] = React.useState(false);
    const [renderUniqueConversationWithMessages, setRenderUniqueConversationWithMessages] = React.useState(false);
    const [messagesFromConversation, setMessagesFromConversation] = React.useState<DecodedMessage[]>([]);
    const [myAddress, setMyAddress] = React.useState<string>("");

    const RenderConversations = (): JSX.Element => {
        return (
            <div>
                <Modal
                    open={renderConversations}
                    onClose={() => setRenderConversations(false)}
                >
                    <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "70vw", height: "70vh" }}>
                        <Paper sx={{ display: "flex", flex: 1, flexDirection: "column", width: "100%", height: "100%", padding: "12px" }}>
                            <Stack style={{ display: "flex", width: "100%", height: "100%", padding: "12px" }}>
                                <div style={{ display: "flex", width: "100%", height: "95%", overflow: "auto" }}>
                                    <List style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                        {
                                            conversations.map((conversation, id) => {
                                                return (
                                                    <div key={id} style={{ flex: 1, width: "100%" }}>
                                                        <ListItem>
                                                            <ListItemButton onClick={async () => {
                                                                const messagesInConversation = await conversation.messages();
                                                                setMessagesFromConversation(messagesInConversation);
                                                                setRenderUniqueConversationWithMessages(true);
                                                            }}>
                                                                <ListItemIcon>
                                                                    <DraftsIcon />
                                                                </ListItemIcon>
                                                                <ListItemText primary={`${conversation.peerAddress}`} />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    </div>
                                                );
                                            })
                                        }
                                    </List>
                                </div>
                                <div style={{ display: "flex", width: "100%", height: "5%", marginTop: "24px", justifyContent: "flex-end" }}>
                                    <Button onClick={() => setRenderConversations(false)}>CLOSE</Button>
                                </div>
                            </Stack>
                        </Paper>
                    </Box>
                </Modal>
            </div>
        );
    };

    const RenderUniqueConversationWithMessages = (): JSX.Element => {
        return (
            <div>
                <Modal
                    open={renderUniqueConversationWithMessages}
                    onClose={() => setRenderUniqueConversationWithMessages(false)}
                >
                    <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "70vw", height: "70vh" }}>
                        <Paper sx={{ display: "flex", flex: 1, flexDirection: "column", width: "100%", height: "100%", padding: "12px" }}>
                            <Stack style={{ display: "flex", width: "100%", height: "100%", padding: "12px" }}>
                                <div style={{ display: "flex", width: "100%", height: "95%", overflow: "auto" }}>
                                    <List style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                        {
                                            messagesFromConversation.map((message, id) => {
                                                return (
                                                    <div key={id} style={{ flex: 1, width: "100%" }}>
                                                        {
                                                            message.senderAddress === myAddress ?
                                                                <></>
                                                                :
                                                                (<>
                                                                    <ListItem>
                                                                    <Link href={`${message.content}`}>Link to shard</Link>
                                                                    </ListItem>
                                                                    <Divider />
                                                                </>)
                                                        }
                                                    </div>
                                                );
                                            })
                                        }
                                    </List>
                                </div>
                                <div style={{ display: "flex", width: "100%", height: "5%", marginTop: "24px", justifyContent: "flex-end" }}>
                                    <Button onClick={() => setRenderUniqueConversationWithMessages(false)}>CLOSE</Button>
                                </div>
                            </Stack>
                        </Paper>
                    </Box>
                </Modal>
            </div>
        );
    };

    async function onSignIn() {
        const MMSDK = new MetaMaskSDK({
            injectProvider: true,
            dappMetadata: {
                name: "Sharder",
                url: process.env.REACT_APP_WALLET_CONNECT_DOMAIN,
            }
        });

        await MMSDK.init()
        if (window.ethereum) {
            await window.ethereum.request({ method: 'eth_requestAccounts' })
        }

        const provider = new ethers.BrowserProvider(MMSDK.getProvider());
        setProvider(provider);
        setIsConnected(true);

        const xmtp = await Client.create(await provider.getSigner(), { env: "production" });
        const convs = await xmtp.conversations.list();
        setConversations(convs);

        setMyAddress(xmtp.address);
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
                    isConnected ?
                        <>
                            <Stack alignItems={"center"} direction={"row"}>
                                <IconButton onClick={() => {
                                    setRenderConversations(true);
                                }}>
                                    <ForumIcon />
                                </IconButton>
                            </Stack>
                        </>
                        :
                        (<Button onClick={onSignIn}>
                            Connect
                        </Button>)
                }
            </Toolbar>
            <Divider />
            {
                renderConversations ? RenderConversations() : <></>
            }
            {
                renderUniqueConversationWithMessages ? RenderUniqueConversationWithMessages() : <></>
            }
        </AppBar>
    );
}