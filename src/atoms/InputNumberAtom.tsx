import React, {ChangeEvent} from "react";
import {TextField} from "@mui/material";

interface InputNumberAtomProps {
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}
export default function InputNumberAtom({
    value,
    min,
    max,
    step,
    onChange,
}: InputNumberAtomProps) {
    return (
        <TextField
            sx={{ marginLeft: "12px", marginRight: "12px", width: "25%", minWidth: "60px" }}
            onChange={onChange}
            inputProps={{
                step: step,
                min: min,
                max: max,
                type: "number",
                "aria-labelledby": "input-slider",
            }}
            value={value}
        />
    );
}