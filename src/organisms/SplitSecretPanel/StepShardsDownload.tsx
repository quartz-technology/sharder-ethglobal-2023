import React, { useState } from "react";
import {Button, Stack, Typography, Box, TextField} from "@mui/material";
import {useSharderContext} from "../../hooks/context/SharderContext";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import {DataGrid, GridColDef, GridPagination, GridRowSelectionModel} from "@mui/x-data-grid";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import {useLazyQuery} from "@airstack/airstack-react";
import {AirstackResolvedXMTP, USER_HAS_XMTP_RESOLVER} from "../../graphql/resolve";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {MetaMaskSDK} from "@metamask/sdk";
import {ethers} from "ethers";
import {Client} from "@xmtp/xmtp-js";
import {
    Attachment,
    AttachmentCodec,
    RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
import {Filelike, Web3Storage} from "web3.storage";

export class Upload implements Filelike {
    name: string;
    data: Uint8Array;

    constructor(name: string, data: Uint8Array) {
        this.name = name;
        this.data = data;
    }

    stream(): ReadableStream {
        const self = this;
        return new ReadableStream({
            start(controller) {
                controller.enqueue(Buffer.from(self.data));
                controller.close();
            },
        });
    }
}

export default function StepShardsDownload(): JSX.Element {
    const {splitSecret: {file, threshold, shardNumber, fileList}} = useSharderContext();
    const [selectedFiles, setSelectedFiles] = useState<{file: File, ethAddress: string}[]>([]);
    const [ethAddresses, setEthAddresses] = useState<string[]>(new Array(fileList.length).fill(""));

    const handleETHAddressChange = (index: number, newValue: string) => {
        const newAddresses = [...ethAddresses];
        newAddresses[index] = newValue;
        setEthAddresses(newAddresses);

        // find the corresponding file in selectedFiles and update its ethAddress
        const newSelectedFiles = selectedFiles.map((fileInfo, i) => {
            if (i === index) {
                return { ...fileInfo, ethAddress: newValue };
            }
            return fileInfo;
        });
        setSelectedFiles(newSelectedFiles);
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", flex: 1 },
        { field: "fileName", headerName: "File Name", flex: 2},
        {
            field: "ethAddress",
            headerName: "ETH Address",
            flex: 2,
            renderCell: (params) => (
                <TextField
                    variant="outlined"
                    size="small"
                    value={ethAddresses[params.row.id - 1] || ""}
                    onChange={(event) => handleETHAddressChange(params.row.id - 1, event.target.value)}
                />
            ),
        },
    ];

    const rows =  fileList.map((file, index) => ({
        id: index + 1,
        fileName: file.name,
        file: file
    }));

    const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
        const newSelectedFiles = newSelection.map((id) => {
            const fileIndex = id as number - 1;

            return {
                file: fileList[fileIndex],
                ethAddress: ethAddresses[fileIndex] || "",
            };
        });
        setSelectedFiles(newSelectedFiles);
    };

    const handleDownloadClick = async () => {
        const zip = new JSZip();

        selectedFiles.forEach(({file, ethAddress}) => {
            zip.file(file.name, file);
        });

        const zipContent = await zip.generateAsync({ type: "blob" });
        saveAs(zipContent, "sharder.zip");

    };

    const [resolveXMTP, { data, loading }] = useLazyQuery(
        USER_HAS_XMTP_RESOLVER,
        {},
        { cache: true }
    );

    const handleShareClick = async () => {
        const MMSDK = new MetaMaskSDK({
            injectProvider: true,
            dappMetadata: {
                name: "Sharder",
                url: process.env.REACT_APP_WALLET_CONNECT_DOMAIN,
            }
        });

        // await MMSDK.init()
        if (window.ethereum) {
            await window.ethereum.request({ method: 'eth_requestAccounts' })
        }
        const provider = new ethers.BrowserProvider(MMSDK.getProvider());

        const signer = await provider.getSigner();
        const xmtp = await Client.create(signer, { env: "production" });
        xmtp.registerCodec(new AttachmentCodec());
        xmtp.registerCodec(new RemoteAttachmentCodec());

        for (const {file, ethAddress} of selectedFiles) {
            const {data} = await resolveXMTP({
                address: ethAddress,
            });

            const res = data as AirstackResolvedXMTP;
            if (res.XMTPs === null || res.XMTPs.XMTP === null) {
                toast.error(`Recipient for shard "${file.name}" does not have an XMTP account`, {
                    position: "bottom-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });

                return;
            }
        }

        const filesPerTarget = new Map<string, File[]>();
        for (const {file, ethAddress} of selectedFiles) {
            const fileForTarget = filesPerTarget.get(ethAddress);

            if (fileForTarget) {
                fileForTarget.push(file);
                filesPerTarget.set(ethAddress, fileForTarget);
            } else {
                filesPerTarget.set(ethAddress, [file]);
            }
        }

        filesPerTarget.forEach((files, target) => {
            (async () => {
                const conversation = await xmtp.conversations.newConversation(target);

                for (const file of files) {
                    const attachment: Attachment = {
                        filename: file.name,
                        mimeType: file.type,
                        data: new Uint8Array(await file.arrayBuffer()),
                    };

                    toast.warn(`Shard [${file.name}] is in transit!`, {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    const upload = new Upload(attachment.filename, attachment.data);
                    const web3Storage = new Web3Storage({
                        token: process.env.REACT_APP_WEB3_STORAGE_API_KEY as string,
                    });
                    const cid = await web3Storage.put([upload]);
                    const url = `https://${cid}.ipfs.w3s.link/${attachment.filename}`;

                    conversation.send(url).then(() => {
                        toast.success(`Shard [${file.name}] has been sent using XMTP!`, {
                            position: "top-right",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                        });
                    });
                }
            })()
        });

        /*
        for (const {file, ethAddress} of selectedFiles) {
            const attachment: Attachment = {
                filename: file.name,
                mimeType: file.type,
                data: new Uint8Array(await file.arrayBuffer()),
            };

            const upload = new Upload(attachment.filename, attachment.data);
            const web3Storage = new Web3Storage({
                token: process.env.REACT_APP_WEB3_STORAGE_API_KEY as string,
            });
            const cid = await web3Storage.put([upload]);
            const url = `https://${cid}.ipfs.w3s.link/${attachment.filename}`;

            console.log(url);

            const conversation = await xmtp.conversations.newConversation(ethAddress);
            await conversation.send(url);
            const upload = new Upload(encryptedEncoded.digest, encryptedEncoded.payload);

            const web3Storage = new Web3Storage({
                token: process.env.REACT_APP_WEB3_STORAGE_API_KEY as string,
            });

            const cid = await web3Storage.put([upload]);
            const url = `https://${cid}.ipfs.w3s.link/${encryptedEncoded.digest}`;

            console.log(url)

            const remoteAttachment: RemoteAttachment = {
                url: url,
                contentDigest: encryptedEncoded.digest,
                salt: encryptedEncoded.salt,
                nonce: encryptedEncoded.nonce,
                secret: encryptedEncoded.secret,
                scheme: "https://",
                filename: attachment.filename,
                contentLength: attachment.data.byteLength,
            };

            const conversation = await xmtp.conversations.newConversation(ethAddress);
            await conversation.send(remoteAttachment, {
                contentType: ContentTypeRemoteAttachment,
                contentFallback: url,
            })

            console.log(remoteAttachment)
        }
        */
    };

    const CustomFooter = () => (
        <>
            <Box sx={{ display: { xs: "none", sm: "inherit" }}}>
                <Stack direction={"row"} spacing={2} >
                    {selectedFiles.length > 0 &&
                    <>
                        <Typography sx={{margin: "12px", display: "flex"}} variant="body2">{`${selectedFiles.length} row selected`}</Typography>
                        <Button onClick={handleDownloadClick} startIcon={<DownloadIcon />}>
                            Download
                        </Button>
                        <Button onClick={handleShareClick} startIcon={<ShareIcon />}>
                            Share
                        </Button>
                    </>
                    }
                    <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                        <GridPagination />
                    </div>
                </Stack>
            </Box>

            {/*  Mobile view  */}
            <Box sx={{ display: { xs: "flex", sm: "none" }, flex: 1}}>
                <Stack direction={"column"}  flex={1} >
                    {selectedFiles.length > 0 &&
                        <>
                            <Button onClick={handleDownloadClick} startIcon={<DownloadIcon />}>
                                {`Download ${selectedFiles.length} shards`}
                            </Button>
                            <Button onClick={handleShareClick} startIcon={<ShareIcon />}>
                                {`Share ${selectedFiles.length} shards`}
                            </Button>
                        </>
                    }
                    <div style={{ flex: 1, display: "flex" }}>
                        <GridPagination />
                    </div>
                </Stack>
            </Box>
        </>
    );


    return (
        <div
            style={{
                display: "flex",
                flex: 1,
            }}>
            <div
                style={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "column"
                }}
            >
                <Box sx={{
                    display: "flex",
                    flex: 1,
                }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        checkboxSelection
                        slots={{
                            footer: CustomFooter,
                        }}
                        onRowSelectionModelChange={handleSelectionChange}
                    />
                </Box>

                {/* Infos Table */}
                <Box
                    sx={{
                        display: "flex",
                        flex: 1,
                    }}
                >
                    <TableContainer component={Paper} style={{ maxHeight: 150 }} >
                        <Table sx={{ minWidth: 100, maxHeight: 50 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>File Name</TableCell>
                                    <TableCell align="right">Shards Number</TableCell>
                                    <TableCell align="right">Threshold</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow
                                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {file?.name}
                                    </TableCell>
                                    <TableCell align="right">{shardNumber}</TableCell>
                                    <TableCell align="right">{threshold}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
            <ToastContainer />
        </div>
    );
}