import { Button } from "@mui/material";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { NameValue } from "./Application";
import { GenericNotify } from "./GenericNotify";

export default {
  component: GenericNotify,
} as ComponentMeta<typeof GenericNotify>;

const Template: ComponentStory<typeof GenericNotify> = (args) => <GenericNotify {...args} />;

const Notify1 = { title: "yo", body: <>Waddup</> };

export const OneNotification = Template.bind({});
OneNotification.args = { handleClose: () => {}, value: Notify1 };
