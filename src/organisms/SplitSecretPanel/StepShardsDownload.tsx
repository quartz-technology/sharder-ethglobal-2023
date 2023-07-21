import React, {useEffect, useState} from "react";
import {Button, Stack, Typography, Box} from "@mui/material";
import {useSharderContext} from "../../hooks/context/SharderContext";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {DataGrid, GridColDef, GridPagination, GridRowSelectionModel} from "@mui/x-data-grid";
import { saveAs } from "file-saver";
import JSZip from "jszip";

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "fileName", headerName: "File Name", flex: 4},
];

export default function StepShardsDownload(): JSX.Element {
    const {splitSecret: {file, threshold, shardNumber, fileList}, setSplitSecret} = useSharderContext();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // TODO: Remove this useEffect just here for create fake FileList
    useEffect(() => {
        // This function creates a new Blob (binary large object) as a File.
        const createFile = (name: string) => new File(["content"], name, { type: "text/plain" });

        const files = Array.from({ length: shardNumber }, (_, i) => createFile(`file${i + 1}.txt`));

        // Update the SharderContext state
        setSplitSecret((prevState) => ({
            ...prevState,
            fileList: files
        }));
    }, [setSplitSecret]);

    const rows =  fileList.map((file, index) => ({
        id: index + 1,
        fileName: file.name,
        file: file
    }));

    const handleSelectionChange = (newSelection:  GridRowSelectionModel) => {
        const newSelectedFiles = newSelection.map((item) => fileList[item as number - 1]);
        setSelectedFiles(newSelectedFiles);
    };

    const handleDownloadClick = async () => {
        const zip = new JSZip();

        selectedFiles.forEach((file) => {
            zip.file(file.name, file);
        });

        const zipContent = await zip.generateAsync({ type: "blob" });

        saveAs(zipContent, "sharder.zip");
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
                    <Button onClick={handleDownloadClick} startIcon={<DownloadIcon />}>
                        {`${selectedFiles.length} row selected`}
                    </Button>
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