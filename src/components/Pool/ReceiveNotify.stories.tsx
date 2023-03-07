import { Button } from "@mui/material";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { NameValue } from "./Application";
import { ReceiveNotify } from "./ReceiveNotify";

export default {
  component: ReceiveNotify,
} as ComponentMeta<typeof ReceiveNotify>;

const Notify1: NameValue = { name: "MCK", value: 100n.toString() };
const Notify2: NameValue = { name: "MCK2", value: 1500000000000n.toString() };

/*
const OneNotify: ComponentStory<typeof ReceiveNotify> = (args) => {
  
  <ReceiveNotify {...args} />
}
*/

const Template: ComponentStory<typeof ReceiveNotify> = (args) => <ReceiveNotify {...args} />;

export const OneNotification = Template.bind({});
OneNotification.args = { handleClose: () => {}, value: Notify1 };
