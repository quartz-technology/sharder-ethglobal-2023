import React, {useState} from "react";
import {
    Box,
    Button,
    Fade, FormControl, ListItemIcon, ListItemText, MenuItem,
    Paper, Select, SelectChangeEvent
} from "@mui/material";
import DropBox from "../molecules/DropBox";
import {useSharderContext} from "../hooks/context/SharderContext";
import {combineFromFiles} from "../utils/combineFromFiles";
import {saveAs} from "file-saver";
import DownloadIcon from "@mui/icons-material/Download";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import RawOnIcon from "@mui/icons-material/RawOn";
interface Option {
    value: string;
    label: string;
    icon: JSX.Element;
}

const options: Option[] = [
    { value: "txt", label: ".txt", icon: <TextFieldsIcon /> },
    { value: "raw", label: ".raw", icon: <RawOnIcon /> },
    { value: "pdf", label: ".pdf", icon: <PictureAsPdfIcon /> },
    { value: "png", label: ".png", icon: <ImageIcon /> },
    { value: "jpg", label: ".jpg", icon: <ImageIcon /> },
];

export default function CombineShardsPanel(): JSX.Element {
    const {combineShards: { fileList}, setCombineShards} = useSharderContext();
    const [formatFile, setFormatFile] = useState<string>("txt");
    const onSend = (files: File[]) => {
        if (files.length >= 1) {
            setCombineShards(prevState => ({...prevState, fileList: files}));
        }
    };

    const onClear = () => {
        setCombineShards(prevState => ({...prevState, fileList: []}));
    };

    const onSubmit = async () => {
        const combinedFile = await combineFromFiles(fileList);

        setCombineShards(prevState => ({...prevState, file: combinedFile}));

        saveAs(combinedFile, "sharder_output." + formatFile);
    };

    const isDisabledSubmitOnDrop = () :boolean => {
        return fileList.length === 0;
    };

    const handleChange = (event: SelectChangeEvent<string>) => {
        setFormatFile(event.target.value);
    };

    return (
        <Fade in={true} style={{ transitionDelay: "200ms" }}>
            <div style={{ display: "flex", flex: 1, flexDirection: "column", marginTop: "12px" }}>
                <Paper sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ display: "flex", flex: 1}} >
                        <DropBox inputID={"combine"} onSend={onSend} onClear={onClear} multiple />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", margin: "12px"}}>
                        <FormControl variant="outlined" size="small" style={{ marginRight: "10px" }}>
                            <Select
                                value={formatFile}
                                onChange={handleChange}
                                size={"small"}
                                sx={{ width: 150, fontSize: "0.875rem" }}
                                displayEmpty
                            >
                                {options.map((option) => (
                                    <MenuItem value={option.value} key={option.value}>
                                        <Box display="flex" alignItems="center">
                                            <ListItemIcon>
                                                {option.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={option.label} />
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button onClick={onSubmit} startIcon={<DownloadIcon />} disabled={isDisabledSubmitOnDrop()}>
                            Download
                        </Button>
                    </div>
                </Paper>
            </div>
        </Fade>
    );
}