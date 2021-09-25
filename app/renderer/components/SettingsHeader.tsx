import * as React from "react";
import { Navbar, Button, Alignment } from "@blueprintjs/core";
import styles from "./SettingsHeader.scss";

interface Props {
  backgroundColor: string;
  handleSave: () => void;
  showSave: boolean;
  textColor: string;
}

export default function SettingsHeader(props: Props) {
  const { backgroundColor, handleSave, showSave, textColor } = props;

  const style = {
    color: textColor,
    backgroundColor,
  };

  return (
    <Navbar className={`${styles.navbar} bp3-dark`} style={style}>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>
          <strong>Settings</strong>
        </Navbar.Heading>
      </Navbar.Group>
      {showSave && (
        <Navbar.Group align={Alignment.RIGHT}>
          <Button outlined onClick={handleSave}>
            Save
          </Button>
        </Navbar.Group>
      )}
    </Navbar>
  );
}
