import { ChatPanel } from "@/components/ChatPanel";

const Index = () => {
  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex flex-col min-w-0">
        <ChatPanel />
      </main>
    </div>
  );
};

export default Index;
