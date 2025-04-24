// app/create-event/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateEventform from "@/components/admincomponents/CreateEvent/CreateEventform";

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/LandingPage");
  }

  return (
    <div className="container">
      <CreateEventform isOrganizer={true} />
    </div>
  );
}
