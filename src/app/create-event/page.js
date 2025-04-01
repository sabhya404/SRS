// app/create-event/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateEventform from "@/components/admincomponents/CreateEventform";

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/LandingPage");
  }

  return (
    <div className="container">
      <h1>Create New Event</h1>
      <CreateEventform isOrganizer={true} />
    </div>
  );
}
