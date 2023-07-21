import React, { useState } from "react";
import {Button, Stack, Typography, Box, TextField} from "@mui/material";
import {useSharderContext} from "../../hooks/context/SharderContext";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import {DataGrid, GridColDef, GridPagination, GridRowSelectionModel} from "@mui/x-data-grid";
import { saveAs } from "file-saver";
import JSZip from "jszip";

export default function StepShardsDownload(): JSX.Element {
    const {splitSecret: {file, threshold, shardNumber, fileList}} = useSharderContext();
    const [selectedFiles, setSelectedFiles] = useState<{file: File, ethAddress: string}[]>([]);
    const [ethAddresses, setEthAddresses] = useState<string[]>(new Array(fileList.length).fill(""));


    const handleETHAddressChange = (index: number, newValue: string) => {
        const newAddresses = [...ethAddresses];
        newAddresses[index] = newValue;
        setEthAddresses(newAddresses);
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

    const handleShareClick = async () => {

        selectedFiles.forEach(({file, ethAddress}) => {
            // TODO: Implement logic of send shared
            console.log(ethAddress);
        });


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
        </div>
    );
}