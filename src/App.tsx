import React, { useState, useEffect, useRef } from "react";
import { 
  GitBranch, 
  GitPullRequest, 
  AlertCircle, 
  CheckCircle2, 
  Wallet, 
  Bot, 
  Search, 
  ArrowRight, 
  Terminal, 
  Sparkles, 
  Github, 
  Cpu, 
  Coins, 
  User, 
  Code2, 
  Check, 
  RefreshCw, 
  ShieldAlert, 
  TrendingUp, 
  Settings2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Interface definitions
interface Contributor {
  id: string;
  name: string;
  github: string;
  wallet: string;
  skills: string[];
  reputation: number;
  completedPrs: number;
  rank: number;
  matchScore?: number;
  matchReasoning?: string;
  avatarUrl: string;
}

interface Issue {
  id: number;
  title: string;
  description: string;
  repo: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unscanned";
  skillsRequired: string[];
  bounty: number; // in STT tokens
  status: "open" | "scanning" | "scanned" | "bounty-set" | "pr-submitted" | "merged";
  aiAnalysis?: {
    summary: string;
    suggestedBounty: number;
    skillsRequired: string[];
    difficulty: "Easy" | "Medium" | "Hard";
    matches: { contributorId: string; score: number; reason: string }[];
  };
}

interface InlineComment {
  line: number;
  file: string;
  type: "security" | "performance" | "style";
  text: string;
  author: string;
}

interface PullRequest {
  id: number;
  issueId: number;
  title: string;
  description: string;
  repo: string;
  author: string;
  status: "open" | "reviewing" | "reviewed" | "merged";
  files: {
    filename: string;
    originalCode: string;
    proposedCode: string;
    comments: InlineComment[];
  }[];
  qualityScore?: number;
  securityScore?: number;
  performanceScore?: number;
  summaryFeedback?: string;
  txHash?: string;
}

interface TerminalLog {
  id: string;
  timestamp: string;
  agent: "System" | "IssueAnalyzer" | "PRReviewer" | "BlockchainPaymaster";
  message: string;
}

export default function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<"maintainer" | "contributor">("maintainer");
  
  // Wallet Connection State
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState("0.0");
  const [networkName, setNetworkName] = useState("Somnia Shannon Testnet");
  const [chainId, setChainId] = useState<string>("50312");

  // Repository Sync State
  const [repoUrl, setRepoUrl] = useState("somnia-network/somnia-core");
  const [repoConnected, setRepoConnected] = useState(true);

  // Application Mock Data States
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: 101,
      title: "Optimizing state transitions gas cost in rollup block builder",
      description: "We need to optimize the block assembly state processing storage writes. Caching values inside execution frame stack frame is needed to reduce L1 update rollup fees.",
      repo: "somnia-network/somnia-core",
      difficulty: "Unscanned",
      skillsRequired: ["Go", "Solidity", "Gas Optimization"],
      bounty: 0,
      status: "open"
    },
    {
      id: 102,
      title: "Implement react hook library for Somnia multi-wallet support",
      description: "Build custom React hooks that handle Somnia testnet network auto-switch, balance updates, and MetaMask session state integrations.",
      repo: "somnia-network/somnia-core",
      difficulty: "Unscanned",
      skillsRequired: ["React", "TypeScript", "ethers.js"],
      bounty: 0,
      status: "open"
    },
    {
      id: 103,
      title: "Add security reentrancy guard check to NFT auction contract",
      description: "Audit custom marketplace auction bid withdraw routine to ensure check-effects-interactions pattern is followed. Protect from atomic flashloan withdraw loops.",
      repo: "somnia-network/somnia-core",
      difficulty: "Unscanned",
      skillsRequired: ["Solidity", "Security Auditing", "EVM"],
      bounty: 0,
      status: "open"
    },
    {
      id: 104,
      title: "Create CLI tool for monitoring Shannon testnet validator nodes",
      description: "Write lightweight telemetry scraper script that pings RPC endpoint status, logs block height height lag, and outputs JSON metrics.",
      repo: "somnia-network/somnia-core",
      difficulty: "Unscanned",
      skillsRequired: ["TypeScript", "Node.js", "CLI Tools"],
      bounty: 0,
      status: "open"
    }
  ]);

  const [contributors] = useState<Contributor[]>([
    {
      id: "c1",
      name: "Alice Vance",
      github: "alice_dev",
      wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      skills: ["Solidity", "Gas Optimization", "Go", "EVM"],
      reputation: 840,
      completedPrs: 42,
      rank: 3,
      avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=alice"
    },
    {
      id: "c2",
      name: "Bob Builder",
      github: "bob_frontend",
      wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      skills: ["React", "TypeScript", "Tailwind CSS", "ethers.js"],
      reputation: 480,
      completedPrs: 24,
      rank: 15,
      avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=bob"
    },
    {
      id: "c3",
      name: "Charlie Auditor",
      github: "charlie_security",
      wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      skills: ["Solidity", "Security Auditing", "Smart Contracts", "EVM"],
      reputation: 650,
      completedPrs: 31,
      rank: 8,
      avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=charlie"
    }
  ]);

  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    {
      id: "log-1",
      timestamp: new Date().toLocaleTimeString(),
      agent: "System",
      message: "AI Open Source Maintainer engine initialized."
    },
    {
      id: "log-2",
      timestamp: new Date().toLocaleTimeString(),
      agent: "System",
      message: "Connected to Somnia Testnet. Awaiting repo synching..."
    }
  ]);

  // UI Selection States
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(101);
  const [selectedPrId, setSelectedPrId] = useState<number | null>(null);
  
  // Custom Bounty Value input
  const [customBountyValue, setCustomBountyValue] = useState<string>("500");

  // Contributor Persona state
  const [currentContributorId, setCurrentContributorId] = useState<string>("c1");
  const [isSubmittingPr, setIsSubmittingPr] = useState(false);
  const [prCodeDraft, setPrCodeDraft] = useState("");
  const [prTitleDraft, setPrTitleDraft] = useState("");
  const [prDescDraft, setPrDescDraft] = useState("");

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll terminal logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  // Connect MetaMask Wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const account = accounts[0];
        setWalletAddress(account);
        setWalletConnected(true);
        
        // Request network
        const chainHex = await window.ethereum.request({ method: "eth_chainId" });
        const decimalChain = parseInt(chainHex, 16).toString();
        setChainId(decimalChain);
        
        if (decimalChain === "50312") {
          setNetworkName("Somnia Testnet");
        } else {
          setNetworkName("Unknown Network");
        }

        // Mock a balance check on Somnia
        setWalletBalance("250.0");
        addLog("System", `Wallet connected: ${account.substring(0, 8)}...${account.substring(38)} on chain ${decimalChain}`);
      } catch (error) {
        console.error("Wallet connection failed", error);
        addLog("System", "Wallet connection declined by user.");
      }
    } else {
      // Simulate connection for demo
      setWalletAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
      setWalletBalance("1200.50");
      setWalletConnected(true);
      addLog("System", "MetaMask not detected. Running on simulated Web3 session profile.");
    }
  };

  // Add terminal log helper
  const addLog = (agent: TerminalLog["agent"], message: string) => {
    setTerminalLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent,
        message
      }
    ]);
  };

  // Sync Repository
  const syncRepository = () => {
    if (!repoUrl) return;
    addLog("System", `Connecting repository: github.com/${repoUrl}...`);
    setTimeout(() => {
      setRepoConnected(true);
      addLog("System", `Successfully loaded repository settings and synced issues from github.com/${repoUrl}`);
    }, 1200);
  };

  // Run AI Issue Analysis Simulation
  const scanIssue = (issueId: number) => {
    setIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, status: "scanning" } : issue));
    addLog("IssueAnalyzer", `Triggering Gemini Agent analysis for issue #${issueId}...`);

    let steps = [
      "Fetching issue metadata and contextual comments from GitHub...",
      "Analyzing issue codebase dependencies and related module trees...",
      "Extracting skill profiles and identifying task complexity level...",
      "Matching issue traits against contributor registry on Firebase...",
      "Analysis complete. Generated matching matrix and suggested reward parameter."
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        addLog("IssueAnalyzer", step);
        if (index === steps.length - 1) {
          // Finish scanning, update data
          setIssues(prev => prev.map(issue => {
            if (issue.id === issueId) {
              const matches = getMockMatches(issueId);
              const suggested = issueId === 101 ? 1500 : issueId === 102 ? 600 : issueId === 103 ? 800 : 1200;
              return {
                ...issue,
                difficulty: issueId === 101 ? "Hard" : issueId === 103 ? "Hard" : "Medium",
                status: "scanned",
                aiAnalysis: {
                  summary: getMockSummary(issueId),
                  suggestedBounty: suggested,
                  skillsRequired: issue.skillsRequired,
                  difficulty: issueId === 101 ? "Hard" : issueId === 103 ? "Hard" : "Medium",
                  matches: matches
                }
              };
            }
            return issue;
          }));
        }
      }, (index + 1) * 1200);
    });
  };

  const getMockSummary = (id: number) => {
    switch (id) {
      case 101: return "The issue involves hot-path state updates within the rollup transaction execution pipeline. Caching stateRoot variables locally inside assembly blocks or solidity execution frames avoids expensive sstore/sload cycles, reducing gas emissions.";
      case 102: return "Requires building an interface to handle MetaMask browser injections, checking web3 connection statuses, monitoring active testnet networks, and binding callbacks to updates.";
      case 103: return "Requires checking checks-effects-interactions violations inside standard auctions. Adding reentrancy locks prevents recursive exploit vectors.";
      default: return "Requires basic telemetry dashboard pulling data from Shannon testnet validator nodes via RPC JSON interfaces.";
    }
  };

  const getMockMatches = (id: number) => {
    if (id === 101) {
      return [
        { contributorId: "c1", score: 98, reason: "Alice holds rank #3, has completed 12 gas-optimization PRs in this repo, and is highly skilled in Go/Solidity." },
        { contributorId: "c3", score: 72, reason: "Charlie has Solidity skills, but has lesser experience in low-level Go state transition engines." },
        { contributorId: "c2", score: 15, reason: "Bob is a frontend engineer and has no recorded contributions in Go or contract gas optimization." }
      ];
    } else if (id === 102) {
      return [
        { contributorId: "c2", score: 95, reason: "Bob has completed multiple React/Vite layout enhancements and has strong experience with ethers.js integrations." },
        { contributorId: "c1", score: 35, reason: "Alice is focused on core protocol and has minimal frontend contributions." }
      ];
    } else if (id === 103) {
      return [
        { contributorId: "c3", score: 96, reason: "Charlie is our security auditing specialist, having completed 8 smart contract vulnerability audits." },
        { contributorId: "c1", score: 85, reason: "Alice is highly capable in smart contract coding and gas rules." }
      ];
    }
    return [
      { contributorId: "c2", score: 80, reason: "Bob has typescript experience and CLI layout capability." },
      { contributorId: "c3", score: 40, reason: "Charlie is focused primarily on smart contract audits." }
    ];
  };

  // Set bounty in STT
  const setBountyValue = (issueId: number, amount: number) => {
    setIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, bounty: amount, status: "bounty-set" } : issue));
    addLog("System", `Bounty set for issue #${issueId}: ${amount} STT. Bounty configuration transaction signed on-chain.`);
  };

  // Initialize simulated code editor when contributor selects issue
  const selectIssueAsContributor = (issue: Issue) => {
    setSelectedIssueId(issue.id);
    setPrTitleDraft(`[Fix] Implementation for #${issue.id} - ${issue.title}`);
    setPrDescDraft(`AI agent suggested implementation. Addresses the requirements listed in the issue. Fixes gas leaks / state bindings.`);
    
    if (issue.id === 101) {
      setPrCodeDraft(`// contracts/BlockBuilder.sol
function processBlock(uint256[] memory transactions) public {
    // Current implementation stores result inside global stateRoot directly
    for (uint256 i = 0; i < transactions.length; i++) {
        stateRoot = keccak256(abi.encodePacked(stateRoot, transactions[i]));
    }
}`);
    } else if (issue.id === 102) {
      setPrCodeDraft(`// src/hooks/useSomniaWallet.ts
import { useState, useEffect } from "react";
export function useSomniaWallet() {
  const [activeAddress, setActiveAddress] = useState("");
  // Write connection logic here
  return { activeAddress };
}`);
    } else if (issue.id === 103) {
      setPrCodeDraft(`// contracts/MarketplaceAuction.sol
function withdrawRefund() external {
    uint256 refundAmount = pendingRefunds[msg.sender];
    require(refundAmount > 0, "No refund pending");
    
    // Transfer funds prior to resetting state (Potential Reentrancy!)
    (bool success, ) = msg.sender.call{value: refundAmount}("");
    require(success, "Transfer failed");
    
    pendingRefunds[msg.sender] = 0;
}`);
    } else {
      setPrCodeDraft(`// scripts/nodeScraper.js
console.log("Validator scraper active...");`);
    }
  };

  // Submit Pull Request
  const submitPr = () => {
    if (!selectedIssueId) return;
    const issue = issues.find(i => i.id === selectedIssueId);
    if (!issue) return;

    setIsSubmittingPr(true);
    addLog("System", `Broadcasting PR to GitHub: "${prTitleDraft}"...`);

    // Create proposed code changes
    let proposed = prCodeDraft;
    let file = "BlockBuilder.sol";
    let comments: InlineComment[] = [];

    if (selectedIssueId === 101) {
      file = "BlockBuilder.sol";
      proposed = `// contracts/BlockBuilder.sol
function processBlock(uint256[] memory transactions) public {
    // Optimization: Cache stateRoot in memory stack to avoid repeated SLOW sstore cycles
    bytes32 localRoot = stateRoot;
    uint256 len = transactions.length;
    for (uint256 i = 0; i < len; i = unchecked_inc(i)) {
        localRoot = keccak256(abi.encodePacked(localRoot, transactions[i]));
    }
    stateRoot = localRoot;
}

function unchecked_inc(uint256 i) internal pure returns (uint256) {
    unchecked { return i + 1; }
}`;
      comments = [
        {
          line: 4,
          file: "BlockBuilder.sol",
          type: "performance",
          text: "Excellent design choice: local variable caching prevents SLOAD operations inside the hot-loop, yielding gas reductions of ~35%.",
          author: "PRReviewerAgent"
        },
        {
          line: 6,
          file: "BlockBuilder.sol",
          type: "performance",
          text: "Using unchecked variable increment reduces bytecode execution fees in solidity version >=0.8.0.",
          author: "PRReviewerAgent"
        }
      ];
    } else if (selectedIssueId === 103) {
      file = "MarketplaceAuction.sol";
      proposed = `// contracts/MarketplaceAuction.sol
function withdrawRefund() external {
    uint256 refundAmount = pendingRefunds[msg.sender];
    require(refundAmount > 0, "No refund pending");
    
    // Fixed: Reset state balance BEFORE initiating native transfer (Check-Effects-Interactions)
    pendingRefunds[msg.sender] = 0;
    
    (bool success, ) = msg.sender.call{value: refundAmount}("");
    require(success, "Transfer failed");
}`;
      comments = [
        {
          line: 6,
          file: "MarketplaceAuction.sol",
          type: "security",
          text: "Vulnerability resolved. Resetting user balances prior to transfer prevents recursive withdraw reentry loops.",
          author: "PRReviewerAgent"
        }
      ];
    } else if (selectedIssueId === 102) {
      file = "useSomniaWallet.ts";
      proposed = `// src/hooks/useSomniaWallet.ts
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export function useSomniaWallet() {
  const [address, setAddress] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);

  const connect = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAddress(accounts[0]);
      setConnected(true);
    }
  };

  return { address, connected, connect };
}`;
      comments = [
        {
          line: 12,
          file: "useSomniaWallet.ts",
          type: "style",
          text: "Ethers.js v6 BrowserProvider mapping is correctly formatted.",
          author: "PRReviewerAgent"
        }
      ];
    }

    const mockPr: PullRequest = {
      id: 200 + Math.floor(Math.random() * 100),
      issueId: selectedIssueId,
      title: prTitleDraft,
      description: prDescDraft,
      repo: repoUrl,
      author: contributors.find(c => c.id === currentContributorId)?.github || "contributor",
      status: "open",
      files: [
        {
          filename: file,
          originalCode: prCodeDraft,
          proposedCode: proposed,
          comments: []
        }
      ]
    };

    setTimeout(() => {
      setPullRequests(prev => [...prev, mockPr]);
      setIssues(prev => prev.map(i => i.id === selectedIssueId ? { ...i, status: "pr-submitted" } : i));
      setIsSubmittingPr(false);
      setSelectedPrId(mockPr.id);
      addLog("System", `PR #${mockPr.id} submitted by @${mockPr.author}`);
      
      // Run AI Review Agent
      triggerPrReview(mockPr.id, comments);
    }, 1500);
  };

  // Run PR Reviewer Agent
  const triggerPrReview = (prId: number, comments: InlineComment[]) => {
    setPullRequests(prev => prev.map(pr => pr.id === prId ? { ...pr, status: "reviewing" } : pr));
    addLog("PRReviewer", `Triggering Code Review Agent for PR #${prId}...`);

    let steps = [
      "Performing abstract syntax tree verification on proposed code patches...",
      "Linting changes and verifying test suite compilation integrity...",
      "Running semantic security check to detect reentrancy, integer logic issues...",
      "Comparing performance profiles for gas cost differentials...",
      "Review complete. Generating ratings and applying inline annotations."
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        addLog("PRReviewer", step);
        if (index === steps.length - 1) {
          setPullRequests(prev => prev.map(pr => {
            if (pr.id === prId) {
              const quality = pr.issueId === 101 ? 98 : pr.issueId === 103 ? 100 : 92;
              const security = pr.issueId === 103 ? 100 : 95;
              const performance = pr.issueId === 101 ? 99 : 85;
              return {
                ...pr,
                status: "reviewed",
                qualityScore: quality,
                securityScore: security,
                performanceScore: performance,
                summaryFeedback: pr.issueId === 101 
                  ? "Outstanding gas-optimization patch. The implementation correctly caches state variables and optimizes looping sequences, leading to highly optimized block builders."
                  : pr.issueId === 103 
                    ? "Critical vulnerability fixed. Reentrancy checks are resolved. Excellent compliance with checks-effects-interactions layout."
                    : "Functional implementation of multi-wallet hook library. Tested and verified on mock frameworks.",
                files: pr.files.map(f => ({ ...f, comments: comments }))
              };
            }
            return pr;
          }));
          addLog("PRReviewer", `Review completed for PR #${prId}. Code quality score: ${prId === 101 ? 98 : 95}/100.`);
        }
      }, (index + 1) * 1200);
    });
  };

  // Approve & Merge Pull Request (On-chain execution)
  const approveAndMerge = async (pr: PullRequest) => {
    const issue = issues.find(i => i.id === pr.issueId);
    if (!issue) return;

    addLog("BlockchainPaymaster", `Initiating on-chain verification and reward distribution for PR #${pr.id}...`);

    setPullRequests(prev => prev.map(p => p.id === pr.id ? { ...p, status: "merged" } : p));
    setIssues(prev => prev.map(i => i.id === pr.issueId ? { ...i, status: "merged" } : i));

    // Calculate gas values and token amounts
    const rewardWei = ethers.parseEther((issue.bounty || 100).toString());
    const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    
    // Simulate transaction execution on Somnia Testnet
    setTimeout(() => {
      addLog("BlockchainPaymaster", `Smart Contract Transaction Broadcasted: ${txHash}`);
    }, 1000);

    setTimeout(() => {
      addLog("BlockchainPaymaster", `Verifying developer registration and wallet status...`);
    }, 2000);

    setTimeout(() => {
      addLog("BlockchainPaymaster", `Writing metadata records to OpenSourceRewardManager solidity mapping...`);
    }, 3000);

    setTimeout(() => {
      // Deduct/Add balances
      const amt = issue.bounty || 100;
      setWalletBalance(prev => {
        const val = parseFloat(prev) + amt;
        return val.toFixed(2);
      });

      // Update PR details
      setPullRequests(prev => prev.map(p => p.id === pr.id ? { ...p, txHash: txHash } : p));

      addLog("BlockchainPaymaster", `Transaction confirmed in Block #1409281. Gas Fee: 64,302 Gwei.`);
      addLog("BlockchainPaymaster", `Distributed on-chain reward of ${amt} STT and +25 Reputation points to contributor: @${pr.author}`);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-500 selection:text-white pb-32">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 shadow-[0_0_15px_rgba(124,58,237,0.5)]">
              <Cpu className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                SOMNIA MAINTAINER
              </span>
              <span className="text-xs block text-slate-400 leading-none">Autonomous AI Agent Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Wallet Integration Widget */}
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 py-1 pl-3 pr-1 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono text-slate-300">
                {walletConnected 
                  ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` 
                  : "Disconnected"}
              </span>
              {walletConnected && (
                <Badge variant="outline" className="ml-1 bg-violet-950/30 border-violet-800/50 text-violet-300 gap-1 py-0.5">
                  <Coins className="h-3 w-3" />
                  {walletBalance} STT
                </Badge>
              )}
              <Button 
                onClick={connectWallet} 
                size="sm" 
                className={`rounded-full h-7 text-xs font-semibold ${
                  walletConnected 
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-none" 
                    : "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                }`}
              >
                <Wallet className="h-3.5 w-3.5 mr-1" />
                {walletConnected ? "Connected" : "Connect"}
              </Button>
            </div>

            {/* Role switch toggles */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("maintainer")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === "maintainer"
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Settings2 className="h-3.5 w-3.5" />
                Maintainer
              </button>
              <button
                onClick={() => {
                  setActiveTab("contributor");
                  // Auto pick first scanned/available issue
                  const available = issues.find(i => i.status !== "open");
                  if (available) selectIssueAsContributor(available);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === "contributor"
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Contributor
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Repo sync bar */}
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800 bg-slate-900/40 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Github className="h-6 w-6 text-slate-400" />
            <div className="flex-1 md:flex-none">
              <span className="text-xs text-slate-400 block font-semibold">Active Repository Source</span>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="owner/repo"
                  className="h-8 w-64 bg-slate-950 border-slate-800 text-xs font-mono text-slate-300"
                />
                <Button onClick={syncRepository} size="sm" className="h-8 bg-slate-800 hover:bg-slate-700 border-none">
                  Sync
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Contract: <span className="text-violet-400">0xRewardManager...</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              AI Agents: <span className="text-cyan-400">Online</span>
            </div>
          </div>
        </div>

        {/* MAINTAINER CONSOLE */}
        {activeTab === "maintainer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Issues Board */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-violet-400" />
                  GitHub Repository Issues
                </h2>
                <Badge variant="outline" className="bg-slate-900/60 border-slate-800 text-slate-400">
                  {issues.length} Issues Loaded
                </Badge>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {issues.map(issue => (
                  <Card 
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className={`cursor-pointer border transition-all ${
                      selectedIssueId === issue.id 
                        ? "bg-slate-900/60 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.15)]" 
                        : "bg-slate-900/20 border-slate-800 hover:border-slate-700 hover:bg-slate-900/30"
                    }`}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">#{issue.id}</span>
                        <div className="flex gap-1.5">
                          <Badge 
                            variant="secondary" 
                            className={`text-[10px] ${
                              issue.difficulty === "Hard" 
                                ? "bg-rose-950/40 text-rose-300 border-rose-800/40" 
                                : issue.difficulty === "Medium"
                                  ? "bg-amber-950/40 text-amber-300 border-amber-800/40"
                                  : issue.difficulty === "Easy"
                                    ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40"
                                    : "bg-slate-900 text-slate-400 border-slate-800"
                            }`}
                          >
                            {issue.difficulty}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${
                              issue.status === "open"
                                ? "bg-slate-900 text-slate-400 border-slate-800"
                                : issue.status === "scanning"
                                  ? "bg-cyan-950/30 border-cyan-800/40 text-cyan-300"
                                  : issue.status === "scanned"
                                    ? "bg-violet-950/30 border-violet-800/40 text-violet-300"
                                    : issue.status === "bounty-set"
                                      ? "bg-amber-950/30 border-amber-800/40 text-amber-300"
                                      : "bg-emerald-950/30 border-emerald-800/40 text-emerald-300"
                            }`}
                          >
                            {issue.status}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-sm font-semibold mt-1.5 text-slate-200 group-hover:text-violet-400">
                        {issue.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {issue.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {issue.skillsRequired.map((skill, i) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800/60">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    {issue.bounty > 0 && (
                      <CardFooter className="p-4 pt-0 border-t border-slate-900/60 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-amber-400">
                          <Coins className="h-3.5 w-3.5" />
                          {issue.bounty} STT Bounty
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Reward Setup Active</span>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Right: Issue details & AI Analysis Panel */}
            <div className="lg:col-span-7 space-y-6">
              {selectedIssueId ? (
                (() => {
                  const issue = issues.find(i => i.id === selectedIssueId);
                  if (!issue) return null;
                  return (
                    <div className="space-y-6">
                      <Card className="bg-slate-900/20 border-slate-800">
                        <CardHeader className="border-b border-slate-800/50 pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <span className="text-xs font-mono text-slate-500">github.com/{issue.repo} • Issue #{issue.id}</span>
                              <CardTitle className="text-lg font-bold mt-1 text-slate-100">{issue.title}</CardTitle>
                            </div>
                            {issue.status === "open" && (
                              <Button 
                                onClick={() => scanIssue(issue.id)}
                                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.3)] text-xs"
                              >
                                <Bot className="h-4 w-4" />
                                Run AI Analysis
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-6 space-y-6">
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                            <p className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                              {issue.description}
                            </p>
                          </div>

                          {/* AI Scanning progress bar */}
                          {issue.status === "scanning" && (
                            <div className="space-y-3 bg-violet-950/10 border border-violet-900/30 p-4 rounded-lg animate-pulse">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-violet-300 flex items-center gap-2">
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-violet-400" />
                                  AI issue scanning and matching engine running...
                                </span>
                                <span className="text-violet-400 font-bold">In Progress</span>
                              </div>
                              <Progress value={45} className="bg-slate-800 h-1.5" />
                            </div>
                          )}

                          {/* AI Results */}
                          {issue.aiAnalysis && (
                            <div className="space-y-6 border-t border-slate-800 pt-6">
                              <div className="bg-gradient-to-br from-violet-950/20 to-cyan-950/20 border border-violet-800/40 p-4 rounded-xl space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                                    <Sparkles className="h-4 w-4 text-cyan-400" />
                                    AI Agent Evaluation Complete
                                  </div>
                                  <Badge className="bg-violet-900/40 border border-violet-700/50 text-violet-300">
                                    Gemini 1.5 Pro
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  <div className="bg-slate-950/50 border border-slate-900 p-2.5 rounded-lg">
                                    <span className="text-[10px] text-slate-500 block">Suggested Difficulty</span>
                                    <span className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-1">
                                      <TrendingUp className="h-4 w-4 text-amber-400" />
                                      {issue.aiAnalysis.difficulty}
                                    </span>
                                  </div>
                                  <div className="bg-slate-950/50 border border-slate-900 p-2.5 rounded-lg">
                                    <span className="text-[10px] text-slate-500 block">Suggested Bounty</span>
                                    <span className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-0.5">
                                      <Coins className="h-4 w-4 text-emerald-500" />
                                      {issue.aiAnalysis.suggestedBounty} STT
                                    </span>
                                  </div>
                                  <div className="col-span-2 md:col-span-1 bg-slate-950/50 border border-slate-900 p-2.5 rounded-lg">
                                    <span className="text-[10px] text-slate-500 block">Confidence Level</span>
                                    <span className="text-sm font-semibold text-cyan-400 mt-1 block">94% Fit</span>
                                  </div>
                                </div>

                                <div>
                                  <span className="text-[10px] text-slate-500 block mb-1">AI Scan Summary</span>
                                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                    {issue.aiAnalysis.summary}
                                  </p>
                                </div>
                              </div>

                              {/* Bounty Management Config */}
                              {(issue.status === "scanned" || issue.status === "bounty-set") && (
                                <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                                  <div>
                                    <span className="font-semibold text-xs text-slate-300 block">Configure Bounty Payout</span>
                                    <span className="text-[10px] text-slate-500">Deploy Somnia Testnet funds for contribution reward</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={customBountyValue}
                                      onChange={(e) => setCustomBountyValue(e.target.value)}
                                      type="number"
                                      className="h-9 w-24 bg-slate-950 border-slate-800 text-xs font-mono text-slate-300"
                                      placeholder="Bounty in STT"
                                    />
                                    <Button 
                                      onClick={() => setBountyValue(issue.id, parseFloat(customBountyValue))}
                                      size="sm" 
                                      className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
                                    >
                                      Set Bounty Bounties
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Contributor Match Grid */}
                              <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Matched Developer Candidates</h4>
                                <div className="space-y-3">
                                  {issue.aiAnalysis.matches.map((match, i) => {
                                    const dev = contributors.find(c => c.id === match.contributorId);
                                    if (!dev) return null;
                                    return (
                                      <div key={i} className="flex items-start justify-between gap-4 border border-slate-800/60 bg-slate-950/20 p-3 rounded-lg hover:border-slate-700 transition-all">
                                        <div className="flex gap-3">
                                          <img src={dev.avatarUrl} alt={dev.name} className="h-8 w-8 rounded bg-slate-900 border border-slate-800" />
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-xs font-bold text-slate-200">{dev.name}</span>
                                              <span className="text-[10px] text-slate-500">@{dev.github}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                              {match.reason}
                                            </p>
                                            <div className="flex gap-1 mt-2">
                                              {dev.skills.map((s, idx) => (
                                                <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800/40">
                                                  {s}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <Badge className={`h-6 text-[10px] font-mono ${
                                            match.score >= 90 
                                              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40" 
                                              : match.score >= 70 
                                                ? "bg-amber-950/40 text-amber-300 border-amber-800/40"
                                                : "bg-slate-900 text-slate-400 border-slate-800"
                                          }`}>
                                            {match.score}% fit
                                          </Badge>
                                          <span className="block text-[9px] font-mono text-slate-500 mt-2">Rep: {dev.reputation}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()
              ) : (
                <div className="h-96 border border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-8 bg-slate-900/10">
                  <AlertCircle className="h-10 w-10 text-slate-600 mb-2" />
                  <span className="text-sm font-semibold text-slate-400">No Issue Selected</span>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Select a GitHub issue from the board on the left to see the description, analysis tools, and matching stats.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Row: PR Review Center (Incoming contributions) */}
            <div className="lg:col-span-12 mt-8 space-y-6">
              <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                <GitPullRequest className="h-5 w-5 text-violet-400" />
                Pull Request Review Center
              </h2>

              {pullRequests.length === 0 ? (
                <div className="h-48 border border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-8 bg-slate-900/10">
                  <GitBranch className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="text-xs font-semibold text-slate-400">No active Pull Requests submitted</span>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Switch to the Contributor role to simulate writing code and submitting a pull request to trigger the AI review process.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left list of PRs */}
                  <div className="lg:col-span-4 space-y-3">
                    {pullRequests.map(pr => (
                      <Card 
                        key={pr.id}
                        onClick={() => setSelectedPrId(pr.id)}
                        className={`cursor-pointer border transition-all ${
                          selectedPrId === pr.id 
                            ? "bg-slate-900/60 border-violet-500" 
                            : "bg-slate-900/20 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-500">PR #{pr.id}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-[9px] ${
                                pr.status === "open"
                                  ? "bg-slate-950 text-slate-400 border-slate-800"
                                  : pr.status === "reviewing"
                                    ? "bg-cyan-950/30 border-cyan-800/40 text-cyan-300"
                                    : pr.status === "reviewed"
                                      ? "bg-violet-950/30 border-violet-800/40 text-violet-300"
                                      : "bg-emerald-950/30 border-emerald-800/40 text-emerald-300"
                              }`}
                            >
                              {pr.status}
                            </Badge>
                          </div>
                          <CardTitle className="text-xs font-bold mt-1 text-slate-200">
                            {pr.title}
                          </CardTitle>
                          <span className="text-[10px] text-slate-500 block">by @{pr.author}</span>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>

                  {/* Right review details */}
                  <div className="lg:col-span-8">
                    {selectedPrId ? (
                      (() => {
                        const pr = pullRequests.find(p => p.id === selectedPrId);
                        if (!pr) return null;
                        const issue = issues.find(i => i.id === pr.issueId);
                        return (
                          <Card className="bg-slate-900/20 border-slate-800">
                            <CardHeader className="border-b border-slate-800/50 pb-4">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <span className="text-xs font-mono text-slate-500">Pull Request Review</span>
                                  <CardTitle className="text-md font-bold mt-1 text-slate-100">{pr.title}</CardTitle>
                                </div>
                                {pr.status === "reviewed" && (
                                  <Button 
                                    onClick={() => approveAndMerge(pr)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-xs"
                                  >
                                    <Check className="h-4 w-4" />
                                    Approve & Merge
                                  </Button>
                                )}
                              </div>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-6">
                              {/* Ratings metrics */}
                              {pr.status === "reviewed" && (
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg text-center">
                                    <span className="text-[10px] text-slate-500 block">Code Quality</span>
                                    <span className="text-lg font-bold text-violet-400 mt-1">{pr.qualityScore}/100</span>
                                  </div>
                                  <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg text-center">
                                    <span className="text-[10px] text-slate-500 block">Security Auditing</span>
                                    <span className="text-lg font-bold text-emerald-400 mt-1">{pr.securityScore}/100</span>
                                  </div>
                                  <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg text-center">
                                    <span className="text-[10px] text-slate-500 block">Gas / Performance</span>
                                    <span className="text-lg font-bold text-cyan-400 mt-1">{pr.performanceScore}/100</span>
                                  </div>
                                </div>
                              )}

                              {/* Review agent feedback block */}
                              {pr.summaryFeedback && (
                                <div className="bg-violet-950/15 border border-violet-900/35 p-3 rounded-lg">
                                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">AI Agent General Feedback</span>
                                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                                    {pr.summaryFeedback}
                                  </p>
                                </div>
                              )}

                              {/* Files and diff display */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">File Diff & Code Annotations</h4>
                                {pr.files.map((file, idx) => (
                                  <div key={idx} className="border border-slate-800 rounded-lg overflow-hidden">
                                    <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                                      <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                                        <Code2 className="h-3.5 w-3.5 text-slate-400" />
                                        {file.filename}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 bg-slate-950 text-[11px] font-mono leading-relaxed divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-x-auto">
                                      {/* Original Code */}
                                      <div className="p-4 space-y-1">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Original</div>
                                        <pre className="text-rose-400/90 whitespace-pre-wrap">{file.originalCode}</pre>
                                      </div>
                                      {/* Proposed Code */}
                                      <div className="p-4 space-y-1">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Proposed (AI Modified)</div>
                                        <pre className="text-emerald-400/90 whitespace-pre-wrap">{file.proposedCode}</pre>
                                      </div>
                                    </div>

                                    {/* Inline Comments */}
                                    {file.comments.length > 0 && (
                                      <div className="bg-slate-900/20 border-t border-slate-800/80 p-4 space-y-3">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Inline Review Comments</span>
                                        {file.comments.map((comm, cIdx) => (
                                          <div key={cIdx} className="flex gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                                            <div className="flex h-6 w-6 items-center justify-center rounded bg-violet-950/50 text-violet-300">
                                              <Bot className="h-4 w-4" />
                                            </div>
                                            <div className="text-xs">
                                              <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-300">@{comm.author}</span>
                                                <Badge className={`text-[9px] ${
                                                  comm.type === "security" 
                                                    ? "bg-rose-950/40 text-rose-300 border-rose-800/40" 
                                                    : comm.type === "performance"
                                                      ? "bg-cyan-950/40 text-cyan-300 border-cyan-800/40"
                                                      : "bg-slate-900 text-slate-400"
                                                }`}>
                                                  {comm.type}
                                                </Badge>
                                                <span className="text-[10px] text-slate-500">Line {comm.line}</span>
                                              </div>
                                              <p className="text-slate-300 mt-1 font-sans">{comm.text}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* On-chain Payout Receipt */}
                              {pr.txHash && (
                                <div className="border border-emerald-800/30 bg-emerald-950/10 p-4 rounded-xl space-y-3">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                      On-Chain Reward Distributed
                                    </span>
                                    <Badge className="bg-emerald-950/50 border border-emerald-800/50 text-emerald-300">
                                      Confirmed
                                    </Badge>
                                  </div>
                                  <div className="text-[11px] font-mono space-y-1.5 text-slate-400">
                                    <div className="flex justify-between">
                                      <span>Transaction Hash:</span>
                                      <a 
                                        href={`https://shannon-explorer.somnia.network/tx/${pr.txHash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-cyan-400 hover:underline flex items-center gap-1"
                                      >
                                        {pr.txHash.substring(0, 16)}...{pr.txHash.substring(48)}
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Recipient Address:</span>
                                      <span className="text-slate-300">0x70997970C51812dc3A010C7d01b50e0d17dc79C8</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Bounty Disbursed:</span>
                                      <span className="text-emerald-400 font-bold">{(issue ? issue.bounty : 0)} STT</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Reputation Awarded:</span>
                                      <span className="text-violet-400 font-bold">+25 Reputation Points</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })()
                    ) : (
                      <div className="h-64 border border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-8 bg-slate-900/10">
                        <GitPullRequest className="h-8 w-8 text-slate-600 mb-2" />
                        <span className="text-xs font-semibold text-slate-400">No PR Selected</span>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                          Select a pull request from the listing on the left to examine the code diff, AI quality scores, and inline code annotations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* CONTRIBUTOR HUB */}
        {activeTab === "contributor" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Contributor Stats / Profile Widget */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                <User className="h-5 w-5 text-violet-400" />
                Contributor Portfolio
              </h2>

              <Card className="bg-slate-900/20 border-slate-800">
                <CardHeader className="pb-4 border-b border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <Select 
                      value={currentContributorId} 
                      onValueChange={(val) => {
                        setCurrentContributorId(val);
                        // reset IDE
                        const selectedIssue = issues.find(i => i.id === selectedIssueId);
                        if (selectedIssue) selectIssueAsContributor(selectedIssue);
                      }}
                    >
                      <SelectTrigger className="w-full bg-slate-950 border-slate-800">
                        <SelectValue placeholder="Select Profile" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800">
                        {contributors.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} (@{c.github})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(() => {
                    const dev = contributors.find(c => c.id === currentContributorId);
                    if (!dev) return null;
                    return (
                      <div className="flex items-center gap-4 mt-6">
                        <img src={dev.avatarUrl} alt={dev.name} className="h-16 w-16 rounded bg-slate-900 border border-slate-800 shadow-[0_0_15px_rgba(139,92,246,0.15)]" />
                        <div>
                          <CardTitle className="text-base font-bold text-slate-200">{dev.name}</CardTitle>
                          <span className="text-xs text-slate-500 font-mono">github.com/{dev.github}</span>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-violet-900/40 text-violet-300 border-violet-800/40 text-[9px] font-mono">
                              Rep Rank #{dev.rank}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardHeader>

                {(() => {
                  const dev = contributors.find(c => c.id === currentContributorId);
                  if (!dev) return null;
                  return (
                    <CardContent className="pt-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-lg">
                          <span className="text-[10px] text-slate-500 block">Reputation Score</span>
                          <span className="text-base font-bold text-violet-400 mt-1 block">{dev.reputation} RP</span>
                        </div>
                        <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-lg">
                          <span className="text-[10px] text-slate-500 block">PRs Merged</span>
                          <span className="text-base font-bold text-emerald-400 mt-1 block">{dev.completedPrs} PRs</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Verified Skill Matrix</span>
                        <div className="flex flex-wrap gap-1.5">
                          {dev.skills.map((skill, i) => (
                            <span key={i} className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-900">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Wallet Profile</span>
                        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900 text-xs font-mono text-slate-400">
                          <div className="flex justify-between mb-1">
                            <span>Network:</span>
                            <span className="text-slate-300">{networkName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Address:</span>
                            <span className="text-violet-400 text-[10px]">{dev.wallet.substring(0, 10)}...{dev.wallet.substring(34)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  );
                })()}
              </Card>
            </div>

            {/* Right: Task finder & IDE workspace */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Task Finder list */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="h-4 w-4" />
                  Explore Tailored Issue Recommendations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {issues.filter(i => i.status !== "merged").map(issue => {
                    const dev = contributors.find(c => c.id === currentContributorId);
                    const match = issue.aiAnalysis?.matches.find(m => m.contributorId === dev?.id);
                    return (
                      <Card 
                        key={issue.id}
                        onClick={() => selectIssueAsContributor(issue)}
                        className={`cursor-pointer border transition-all ${
                          selectedIssueId === issue.id 
                            ? "bg-slate-900/60 border-violet-500" 
                            : "bg-slate-900/20 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono text-slate-500">#{issue.id}</span>
                            {match && (
                              <Badge className="bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 text-[9px] font-mono">
                                {match.score}% Match Fit
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xs font-bold text-slate-200 mt-1.5">{issue.title}</CardTitle>
                        </CardHeader>
                        <CardFooter className="p-4 pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-slate-900/40">
                          <span className="flex items-center gap-1 font-semibold text-amber-400">
                            <Coins className="h-3 w-3" />
                            {issue.bounty || 100} STT Bounty
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">Ready</span>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Mock Code Workspace / PR submission */}
              {selectedIssueId ? (
                (() => {
                  const issue = issues.find(i => i.id === selectedIssueId);
                  if (!issue) return null;
                  return (
                    <Card className="bg-slate-900/20 border-slate-800">
                      <CardHeader className="border-b border-slate-800/60 pb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xs font-mono text-slate-500">Interactive IDE Workspace</span>
                            <CardTitle className="text-sm font-bold text-slate-200 mt-1">Implement Patch for #{issue.id}</CardTitle>
                          </div>
                          <Badge className="bg-amber-950/30 text-amber-300 border-amber-800/40 gap-1 text-[10px]">
                            <Coins className="h-3 w-3" />
                            Reward: {issue.bounty || 100} STT
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-6 space-y-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Pull Request Title</label>
                            <Input
                              value={prTitleDraft}
                              onChange={(e) => setPrTitleDraft(e.target.value)}
                              className="bg-slate-950 border-slate-800 text-xs font-mono text-slate-300 h-9"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Implementation Code Editor</label>
                            <div className="border border-slate-800 rounded-lg overflow-hidden font-mono text-xs bg-slate-950">
                              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 text-slate-400 flex items-center justify-between text-[10px]">
                                <span>{issue.id === 101 ? "BlockBuilder.sol" : issue.id === 103 ? "MarketplaceAuction.sol" : "useSomniaWallet.ts"}</span>
                                <span className="text-emerald-400">TypeScript / Solidity mode</span>
                              </div>
                              <textarea
                                value={prCodeDraft}
                                onChange={(e) => setPrCodeDraft(e.target.value)}
                                rows={10}
                                className="w-full bg-slate-950 text-slate-300 p-4 font-mono text-xs border-none outline-none focus:ring-0 custom-scrollbar resize-none"
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-1.5">Note: The AI Review Agent will verify your syntax, check for gas levels, and flag vulnerabilities.</span>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Description / Notes</label>
                            <Textarea
                              value={prDescDraft}
                              onChange={(e) => setPrDescDraft(e.target.value)}
                              rows={2}
                              className="bg-slate-950 border-slate-800 text-xs font-sans text-slate-300"
                            />
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="border-t border-slate-850 p-4 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-mono">Wallet status: Connected</span>
                        <Button 
                          onClick={submitPr}
                          disabled={isSubmittingPr}
                          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                        >
                          {isSubmittingPr ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              Submitting PR...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              Submit PR & Run AI Review
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })()
              ) : (
                <div className="h-96 border border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-8 bg-slate-900/10">
                  <Code2 className="h-10 w-10 text-slate-600 mb-2" />
                  <span className="text-sm font-semibold text-slate-400">Select a Task to Begin Coding</span>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Select one of the recommended issues above to load the interactive code workspace and submit a contribution patch.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Floating Agent Terminal logs console */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950 border-t border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-10 items-center justify-between border-b border-slate-900">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-violet-400" />
              Autonomous Agents Communication Channel (Real-time logs)
            </span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-mono">Port 5000 connected</span>
            </div>
          </div>
          
          <div className="h-32 overflow-y-auto py-3 font-mono text-[10px] leading-relaxed space-y-1.5 custom-scrollbar bg-slate-950/80">
            {terminalLogs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                <span className={`font-bold shrink-0 ${
                  log.agent === "System" 
                    ? "text-slate-400" 
                    : log.agent === "IssueAnalyzer"
                      ? "text-cyan-400"
                      : log.agent === "PRReviewer"
                        ? "text-violet-400"
                        : "text-emerald-400"
                }`}>
                  [{log.agent}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </footer>
    </div>
  );
}
