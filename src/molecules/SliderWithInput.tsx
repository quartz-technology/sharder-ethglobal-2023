import React, { ChangeEvent } from "react";
import { Stack } from "@mui/material";
import SliderAtom from "../atoms/SliderAtom";
import InputNumberAtom from "../atoms/InputNumberAtom";

interface ISliderWithInputProps {
    value: number;
    setValue: React.Dispatch<React.SetStateAction<number>>;
}

export default function SliderWithInput({ value, setValue }: ISliderWithInputProps): JSX.Element {

    const handleSliderChange = (
        event: Event,
        newValue: number | number[]
    ) => {
        setValue(newValue as number);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value === "" ? 2 : Number(event.target.value);
        if (inputValue >= 2 && inputValue <= 255) {
            setValue(inputValue);
        }
    };

    return (
        <Stack  alignItems="center" display={"flex"} direction={"row"} spacing={"24px"} >
            <SliderAtom
                value={value}
                min={2}
                max={255}
                step={1}
                onChange={handleSliderChange}
            />
            <InputNumberAtom
                value={value}
                min={2}
                max={255}
                step={1}
                onChange={handleInputChange}
            />
        </Stack>
    );
}

