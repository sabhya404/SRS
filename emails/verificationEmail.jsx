import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
} from "@react-email/components";

export default function VerificationEmail({ username, otp }) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Here&apos;s your verification code: {otp}</Preview>
      <Section>
        <Row>
          <Heading as="h2">Hello {username},</Heading>
        </Row>
        <Row>
          <p>
            Thank you for registering. Please use the following verification
            code to complete your registration:
          </p>
        </Row>
        <Row>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>{otp}</p>
        </Row>
        <Row>
          <p>If you did not request this code, please ignore this email.</p>
        </Row>
      </Section>
    </Html>
  );
}
