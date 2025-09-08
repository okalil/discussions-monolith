import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface Props {
  baseUrl: string;
  email: string;
}

export function ResetPasswordSuccess({ baseUrl, email }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Password Successfully Reset</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
            <Section className="mt-8">
              <Img src={`${baseUrl}/logo.png`} height="32" alt="Discussions" />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-xl font-medium text-black">
              Password Successfully Reset
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Your password has been successfully reset for your account at Discussions.
            </Text>
            <Text className="text-sm leading-6 text-black">
              You can now log in with your new password. If you did not make this change, 
              please contact us immediately.
            </Text>

            <Hr className="mx-0 my-6 w-full border border-neutral-200" />
            <Text className="text-[12px] leading-6 text-neutral-500">
              This email was sent to{" "}
              <span className="text-black">{email}</span>. If you have any concerns 
              about your account's security, please reply to this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ResetPasswordSuccess.PreviewProps = {
  baseUrl: "http://localhost:5173",
  email: "john@due.com",
} as Props;

export default ResetPasswordSuccess;
