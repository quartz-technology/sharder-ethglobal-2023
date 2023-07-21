import React from "react";
import {Box, Stack, Tooltip, Typography} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SliderWithInput from "../../molecules/SliderWithInput";
import {useSharderContext} from "../../hooks/context/SharderContext";

export default function StepShardingConfiguration(): JSX.Element {
    const {splitSecret: {shardNumber, threshold}, setSplitSecret} = useSharderContext();

    const setShardNumber = (value: number) => {
        setSplitSecret(prevState => ({ ...prevState, shardNumber: value }));
    };

    const setThreshold = (value: number) => {
        setSplitSecret(prevState => ({ ...prevState, threshold: value }));
    };


    return (
        <div
            style={{
                display: "flex",
                flex: 1,
            }}
        >
            <div style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}>

                <Box sx={{ width: { xs: "100%", sm: "75%", md: "50%", lg: "50%" }, marginTop: "12px", paddingLeft: "12px" }} >
                    <Stack direction={"row"} spacing={"12px"}>
                        <Typography fontWeight={"bold"} marginBottom={"12px"} >Shards number</Typography>
                        <Tooltip placement={"top"} title="The number of shards you create is the total distribution of these shares, giving you the flexibility to include more participants while maintaining the desired security level." enterTouchDelay={0} leaveTouchDelay={3000}>
                            <HelpOutlineIcon />
                        </Tooltip>
                    </Stack>
                    <SliderWithInput value={shardNumber} setValue={setShardNumber} />
                </Box>

                <Box sx={{ width: { xs: "100%", sm: "75%", md: "50%", lg: "50%" }, marginTop: "12px", paddingLeft: "12px" }} >
                    <Stack direction={"row"} spacing={"12px"}>
                        <Typography fontWeight={"bold"} marginBottom={"12px"}>Threshold</Typography>
                        <Tooltip placement={"top"} title="Represents the minimum number of 'shares' or 'shards' needed to reconstruct the original secret. By setting this threshold, you decide the least number of participants required to come together to decode the secret." enterTouchDelay={0} leaveTouchDelay={3000}>
                            <HelpOutlineIcon />
                        </Tooltip>
                    </Stack>
                    <SliderWithInput value={threshold} setValue={setThreshold} />
                </Box>

            </div>
        </div>
    );
}