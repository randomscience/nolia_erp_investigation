import { Button } from "@mui/material";

export const MainButton: React.FC<{ leftIcon: React.ReactNode; label: String; onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined }> = (props) => {
    return <Button
        size="small"
        variant="outlined"
        startIcon={props.leftIcon}
        onClick={props.onClick}
        sx={{ textTransform: 'none', borderRadius: 1, fontWeight: 600 }}
    >
        {props.label}
    </Button>

}


