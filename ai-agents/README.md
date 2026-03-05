# AI Agents - Instructions & Setup Guides

This directory contains setup instructions, configuration guides, and deployment documentation for building AI agents using various frameworks.

## Directory Structure

```
ai-agents/
├── README.md              # This file
├── claude/                # Anthropic Claude agents
│   └── SETUP.md
├── openai/                # OpenAI agents
│   └── SETUP.md
├── langchain/             # LangChain / LangGraph agents
│   └── SETUP.md
├── crewai/                # CrewAI multi-agent systems
│   └── SETUP.md
└── deployment/            # Deployment guides (Docker, cloud, etc.)
    └── GUIDE.md
```

## Quick Links

| Framework | Best For | Guide |
|-----------|----------|-------|
| [Claude](./claude/SETUP.md) | Conversational agents, tool use, long-context tasks | Setup & API guide |
| [OpenAI](./openai/SETUP.md) | GPT-based agents, assistants API, function calling | Setup & API guide |
| [LangChain](./langchain/SETUP.md) | Chained workflows, RAG, multi-step pipelines | Setup & orchestration guide |
| [CrewAI](./crewai/SETUP.md) | Multi-agent collaboration, role-based agent teams | Setup & crew guide |
| [Deployment](./deployment/GUIDE.md) | Containerization, cloud hosting, production configs | Deployment guide |

## Prerequisites

- Python 3.10+ or Node.js 18+
- API keys for whichever provider you choose
- A virtual environment tool (`venv`, `conda`, or `poetry`)

## Getting Started

1. Pick a framework from the table above
2. Follow the setup guide to install dependencies and configure API keys
3. Run the example agent
4. Check the [deployment guide](./deployment/GUIDE.md) when you're ready to ship
