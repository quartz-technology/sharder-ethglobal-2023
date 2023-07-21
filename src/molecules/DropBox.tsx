import React, { useState } from "react";
import {
    Button,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ClearIcon from "@mui/icons-material/Clear";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface FileDropBoxProps {
    multiple?: boolean;
    onSend?: (files: File[]) => void;
    onClear?: () => void;
    inputID: string
}

const FileDropBox: React.FC<FileDropBoxProps> = ({
    multiple = false,
    onSend,
    onClear,
    inputID
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [dragging, setDragging] = useState(false);

    const handleFileChange = (newFiles: File[]) => {
        setFiles(multiple ? [...files, ...newFiles] : newFiles);
    };

    const handleFileRemove = (index: number) => {
        setFiles(files.filter((_file, i) => i !== index));
        if (files.length <= 1 && onClear) {
            onClear();
        }
    };

    const handleClear = () => {
        setFiles([]);
        if (onClear) {
            onClear();
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        let newFiles = Array.from(e.dataTransfer.files);
        // If multiple is false, only take the first file
        if (!multiple && newFiles.length > 1) {
            newFiles = [newFiles[0]];
        }
        handleFileChange(newFiles);
    };

    return (
        <div
            style={{
                display: "flex",
                flex: 1,
                backgroundColor: dragging ? "lightblue" : "transparent",
                borderRadius: "8px",
                border: dragging ? "2px dashed #000" : "none",
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id={inputID}
                onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
                multiple={multiple}
                style={{ display: "none" }}
            />
            <div
                style={{
                    display: "flex",
                    flex: 1,
                    margin: "12px",
                    flexDirection: "column"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flex: 1,
                    }}>

                    {/* TODO Scrollable this div */}
                    <div style={{display: "flex", flex: 1, justifyContent: "center", alignItems: "center"}}>

                        {files.length > 0 ? (
                            <div style={{ display: "flex", flex: 1, margin: "24px" }}>
                                <List sx={{ flexDirection: "column", justifyContent: "space-between", display: "flex", width: "100%"}}>
                                    {files.map((file, index) => (
                                        <ListItem key={index} >
                                            <ListItemText primary={inputID === "mobile" && file.name.length > 10 ? `${file.name.slice(0, 10)}...` : file.name} />
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" onClick={() => handleFileRemove(index)}>
                                                    <ClearIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            </div>


                        ) : (
                            <Stack display={"flex"} justifyContent={"center"} alignItems={"center"} spacing={"12px"}>
                                <UploadFileIcon />
                                <Typography> Drag TXT or other file here</Typography>
                                <Typography>- or -</Typography>
                                <Button
                                    sx={{ display: "flex" }}
                                    variant="contained"
                                    color="primary"
                                    onClick={() => document.getElementById(inputID)?.click()}
                                >
                                    {multiple ? "Add files" : "Add file"}
                                </Button>
                            </Stack>
                        )}
                    </div>

                </div>
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end"
                }}>


                    {files.length > 0 && (
                        <>
                            <Stack direction={"row"} spacing={"12px"} padding={"12px"}>
                                {multiple &&
                                <Button
                                    sx={{ display: "flex" }}
                                    color="primary"
                                    onClick={() => document.getElementById(inputID)?.click()}
                                >
                                    Add more file(s)
                                </Button>
                                }
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleClear}
                                    startIcon={<DeleteOutlineIcon/>}
                                >
                                Clear
                                </Button>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<FileUploadIcon />}
                                    onClick={() => onSend && onSend(files)}
                                >
                                Send
                                </Button>
                            </Stack>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileDropBox;

