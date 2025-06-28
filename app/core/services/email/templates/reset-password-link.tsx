import {
  Body,
  Button,
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
  token: string;
}

export function ResetPasswordLink({ baseUrl, email, token }: Props) {
  const url = `${baseUrl}/reset-password?token=${token}`;
  return (
    <Html>
      <Head />
      <Preview>Reset Password Link</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
            <Section className="mt-8">
              <Img src={`${baseUrl}/logo.png`} height="32" alt="Discussions" />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-xl font-medium text-black">
              Reset password link
            </Heading>
            <Text className="text-sm leading-6 text-black">
              You are receiving this email because we received a password reset
              request for your account at Discussions.
            </Text>
            <Text className="text-sm leading-6 text-black">
              Please click the button below to reset your password.
            </Text>
            <Section className="my-8 mt-8">
              <Button
                className="rounded-lg bg-black px-6 py-3 text-center text-[12px] font-semibold text-white"
                href={url}
              >
                Reset Password
              </Button>
            </Section>
            <Text className="text-sm leading-6 text-black">
              or copy and paste this URL into your browser:
            </Text>
            <Text className="text-sm font-medium text-purple-600 break-all">
              {url.replace(/^https?:\/\//, "")}
            </Text>

            <Hr className="mx-0 my-6 w-full border border-neutral-200" />
            <Text className="text-[12px] leading-6 text-neutral-500">
              This email was intended for{" "}
              <span className="text-black">{email}</span>. If you were not
              expecting this email, you can ignore this email. If you are
              concerned about your account's safety, please reply to this email
              to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ResetPasswordLink.PreviewProps = {
  baseUrl: "http://localhost:5173",
  email: "john@due.com",
  token: "1e7ab5ef3e239582fa4f0f4fc31ed6b2d77bf46e32f28d7b343644d1946889ae",
} as Props;

export default ResetPasswordLink;
