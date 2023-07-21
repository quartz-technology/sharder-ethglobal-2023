import React from "react";
import {Slider} from "@mui/material";

interface SliderAtomProps {
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (event: Event, newValue: number | number[]) => void;
}
export default function SliderAtom({
    value,
    min, max,
    step,
    onChange
}: SliderAtomProps) {
    return (
        <Slider
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={onChange}
            aria-labelledby="input-slider"
        />
    );
}