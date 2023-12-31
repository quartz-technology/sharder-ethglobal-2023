import React from "react";
import {
    Box,
    Button,
    Fade,
    Paper,
    Stack,
    Step,
    StepConnector,
    stepConnectorClasses,
    StepContent,
    StepLabel,
    Stepper,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import useCurrentWidth from "../../hooks/useCurrentWidth";
import DropBox from "../../molecules/DropBox";
import StepShardingConfiguration from "./StepShardingConfiguration";
import {useSharderContext} from "../../hooks/context/SharderContext";
import StepShardsDownload from "./StepShardsDownload";
import {splitFileIntoShards} from "../../utils/splitFileIntoShards";


const ColoredConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
}));


enum Steps {
    DROP_BOX,
    SHARDING_CONF,
    DOWNLOAD_SHARDS,
}

export default function SplitSecretPanel(): JSX.Element {
    const [loaded, setLoaded] = React.useState<boolean>(false);
    const currentWidth = useCurrentWidth();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerOffsetTop, setContainerOffsetTop] = React.useState<number>(0);

    const [activeStep, setActiveStep] = React.useState<Steps>(Steps.DROP_BOX);
    const {splitSecret: {file, threshold, shardNumber}, setSplitSecret} = useSharderContext();

    // DropZone Functions
    const onSend = (files: File[]) => {
        if (files.length >= 1) {
            setSplitSecret(prevState => ({...prevState, file: files[0]}));
        }
    };

    const onClear = () => {
        setSplitSecret(prevState => ({...prevState, file: undefined}));
    };

    // Component functions
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        // Finish button action
        if (activeStep === steps.length - 2) {
            if (file && threshold && shardNumber) {
                splitFileIntoShards(file, shardNumber, threshold)
                    .then((shardFiles) => {
                        setSplitSecret(prevState => ({...prevState, fileList: shardFiles}));
                        console.log(shardFiles);
                    })
                    .catch((error) => {
                        console.error("Error while splitting file into shards: ", error);
                    });
            }
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        onClear();
        setSplitSecret(prevState => ({...prevState, threshold: 2}));
        setSplitSecret(prevState => ({...prevState, shardNumber: 2}));

    };

    const isDisabledNextOnDrop = () :boolean => {
        return file === undefined;
    };

    const stepMapWeb: Record<Steps, JSX.Element> = {
        [Steps.DROP_BOX]: <DropBox inputID={"web"} onSend={onSend} onClear={onClear} />,
        [Steps.SHARDING_CONF]:<StepShardingConfiguration />,
        [Steps.DOWNLOAD_SHARDS]: <StepShardsDownload />
    };

    const stepMapMobile: Record<Steps, JSX.Element> = {
        [Steps.DROP_BOX]: <DropBox inputID={"mobile"} onSend={onSend} onClear={onClear} />,
        [Steps.SHARDING_CONF]: <StepShardingConfiguration />,
        [Steps.DOWNLOAD_SHARDS]: <StepShardsDownload />
    };

    React.useEffect(() => {
        if (containerRef && containerRef.current) {
            setContainerOffsetTop(containerRef.current.offsetTop + 24);
            setLoaded(true);
        }
    }, [containerRef, currentWidth]);

    const [steps,] = React.useState<string[]>(["Drop your secret", "Configure sharding", "Download your shards"]);

    return (
        <>
            <Stack sx={{ display: { xs: "none", sm: "inherit" } }} width={"100%"} spacing={"12px"}>
                <Stepper
                    sx={{
                        marginTop: "24px",
                    }}
                    activeStep={activeStep}
                    alternativeLabel={true}
                    connector={<ColoredConnector />}
                >

                    {steps.map((label, index) => {
                        const stepProps: { completed?: boolean } = {};
                        const labelProps: {
                        optional?: React.ReactNode;
                    } = {};
                        return (
                            <Step key={index} {...stepProps}>
                                <StepLabel {...labelProps}>{label}</StepLabel>
                            </Step>
                        );
                    })}

                </Stepper>

                <Fade in={true} style={{ transitionDelay: "200ms" }}>
                    <div
                        ref={containerRef}
                        style={{
                            marginTop: "24px",
                            width: "100%",
                            height: `calc(100vh - ${containerOffsetTop}px)`,
                            overflow: "scroll"
                        }}
                    >
                        {loaded &&
                        <Paper sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                            {/* Specific step component */}
                            <div style={{ display: "flex", flex: 1, overflow: "scroll" }}>
                                <div style={{display: "flex", flex: 1}}>
                                    {stepMapWeb[activeStep]}
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", margin: "12px" }}>
                                {activeStep === steps.length - 1 ? (
                                    <div style={{display: "flex", width: "100%", justifyContent: "flex-end"}}>
                                        <Button onClick={handleReset}>Reset</Button>
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            color="inherit"
                                            disabled={activeStep === 0}
                                            onClick={handleBack}
                                            sx={{ mr: 1 }}
                                        >
                                                Back
                                        </Button>
                                        <Button onClick={handleNext} disabled={isDisabledNextOnDrop()} >
                                            {activeStep === steps.length - 2 ? "Finish" : "Next"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Paper>
                        }
                    </div>
                </Fade>
            </Stack>
            {/*  Mobile view  */}
            <Box sx={{ display: { xs: "flex", sm: "none" }, width: "100%" }}>
                <Fade in={true} style={{ transitionDelay: "200ms" }}>
                    <Box sx={{ marginTop: "12px", width: "100%" }}>
                        <Stepper
                            activeStep={activeStep}
                            orientation="vertical"
                            connector={<ColoredConnector />}
                        >
                            {steps.map((step, index) => (
                                <Step key={index}>
                                    <StepLabel>
                                        {step}
                                    </StepLabel>
                                    <StepContent>
                                        <Box>
                                            <Stack spacing={"12px"}>
                                                <Paper sx={{ padding: "12px" }}>
                                                    {/* Specific step component */}
                                                    <div style={{ display: "flex", flex: 1, overflow: "scroll" }}>
                                                        <div style={{display: "flex", flex: 1}}>
                                                            {stepMapMobile[activeStep]}
                                                        </div>
                                                    </div>
                                                </Paper>
                                                <Stack direction={"row"} display={"flex"} justifyContent={"space-between"}>
                                                    {activeStep === steps.length - 1 ? (
                                                        <div style={{display: "flex", width: "100%"}}>
                                                            <Button variant={"contained"} onClick={handleReset}>
                                                                Reset
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Button variant={"contained"} onClick={handleNext} disabled={isDisabledNextOnDrop()}>
                                                                {activeStep === steps.length - 2 ? "Finish" : "Next"}
                                                            </Button>
                                                            <Button
                                                                color="inherit"
                                                                disabled={activeStep === 0}
                                                                onClick={handleBack}
                                                                sx={{ mr: 1 }}
                                                            >
                                                                Back
                                                            </Button>
                                                        </>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                </Fade>
            </Box>
        </>
    );
}
