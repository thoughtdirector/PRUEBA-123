import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import LoginForm from "../components/Admin/LoginForm";
import { ChildrenPlaying, ChildrenPlayingList } from "../types/childrenPlaying";
import ChildrenPlayingTable from "../components/Admin/ChildrenPlayingTable";
import Button from "../components/Button";
import QRScanner from "../components/QRScanner";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [childrenPlaying, setChildrenPlaying] = useState<ChildrenPlayingList>(
    []
  );

  // Mock data for testing
  const childrenTest: ChildrenPlayingList = [
    {
      child_name: "Juanito",
      parent_name: "Pedro",
      active_time: "10",
      start_time: "2023-10-01T10:00:00",
    },
    {
      child_name: "Juanito",
      parent_name: "Pedro",
      active_time: "10",
      start_time: "2023-10-01T10:00:00",
    },
    {
      child_name: "Juanito",
      parent_name: "Pedro",
      active_time: "10",
      start_time: "2023-10-01T10:00:00",
    },
  ];

  const onStopTime = (child: ChildrenPlaying) => {
    console.log("Time ended for child:", child);
  };

  const getChildrenPlaying = () => {
    // Simulate an API call
    console.log("Fetching children playing...");
    setChildrenPlaying(childrenTest);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    setLoggedIn(true);
  };

  useEffect(() => {
    if (loggedIn) {
      getChildrenPlaying();
    }
  }, [loggedIn]);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center gap-2">
      {!loggedIn ? (
        <LoginForm onSubmit={handleLogin} />
      ) : (
        <>
          <h1 className="font-bold text-xl">Dashboard</h1>
          <div className="overflow-x-auto w-full flex items-center justify-center">
            <ChildrenPlayingTable
              childrenPlaying={childrenPlaying}
              onStopTime={onStopTime}
            />
          </div>
          <Button label="Recargar" onClick={getChildrenPlaying} />
          {/* <QRScanner /> */}
        </>
      )}
    </div>
  );
}
