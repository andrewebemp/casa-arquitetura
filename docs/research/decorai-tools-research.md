# DecorAI Brasil - Comprehensive Tools & API Research

**Date:** 2026-03-08
**Purpose:** Research of tools, APIs, libraries, and MCP servers for an AI Interior Design / Virtual Staging platform.

---

## Table of Contents

1. [Image Generation](#1-image-generation)
2. [Segmentation](#2-segmentation)
3. [Depth Estimation](#3-depth-estimation)
4. [Image Enhancement & Inpainting](#4-image-enhancement--inpainting)
5. [Style Transfer / CLIP / IP-Adapter](#5-style-transfer--clip--ip-adapter)
6. [Lighting & Relighting](#6-lighting--relighting)
7. [LLM for Chat (Vision + NLP)](#7-llm-for-chat-vision--nlp)
8. [Object Detection (Open Vocabulary)](#8-object-detection-open-vocabulary)
9. [GPU Inference Platforms](#9-gpu-inference-platforms)
10. [ComfyUI Ecosystem](#10-comfyui-ecosystem)
11. [Payment Gateways (Brazil)](#11-payment-gateways-brazil)
12. [Real Estate Portals (Brazil)](#12-real-estate-portals-brazil)
13. [MCP Servers (Claude Integration)](#13-mcp-servers-claude-integration)
14. [Turnkey Virtual Staging APIs](#14-turnkey-virtual-staging-apis)
15. [Infrastructure & Storage](#15-infrastructure--storage)

---

## 1. Image Generation

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **Stable Diffusion XL (SDXL)** | Library/API | Text-to-image, img2img, inpainting. 1024x1024 native resolution. Base model for interior design generation | 45k+ (CompVis/SD) | Mature/Stable | Free (open-weight); API via Stability AI ~$0.002-0.006/image | Medium |
| **Stable Diffusion 3.5** | API | Latest Stability AI model family. Large (6.5 credits), Large Turbo (4 credits), Medium (3.5 credits) | N/A (API only) | Stable | Paid: ~$0.035/image via Stability API | Easy (REST API) |
| **FLUX.1 / FLUX.2** | Library/API | Black Forest Labs' frontier model. 32B params. Text-to-image + editing in single model. FLUX.2 Klein: sub-second generation | 18k+ (GitHub) | Mature (FLUX.2 released Nov 2025) | Open-weight (Dev/Klein Apache 2.0); Pro via API ~$0.02-0.03/MP | Medium |
| **Replicate API** | API Platform | Model hosting platform. Run SDXL, FLUX, ControlNet, Real-ESRGAN, etc. via REST API. Acquired by Cloudflare late 2025 | N/A (platform) | Mature | Pay-per-second GPU compute; ~$0.002-0.01/image typical | Easy |
| **Stability AI Platform API** | API | Official Stability AI API: generate, edit, upscale, remove background. SD 3.5, SDXL, Stable Image Ultra | N/A (official API) | Mature | Credits-based; free tier for <$1M revenue (Community License) | Easy |
| **AUTOMATIC1111 WebUI** | CLI/Library | Self-hosted Stable Diffusion UI with FastAPI REST API (`/sdapi/v1/*`). Full txt2img, img2img, inpainting | 145k+ GitHub | Mature | Free (self-hosted); GPU costs only | Medium |
| **ControlNet** | Library | Structure-guided image generation: canny edges, depth maps, segmentation maps, scribbles. Critical for room redesign | 32k+ GitHub | Mature | Free (open-source) | Medium |
| **ControlNet Interior Design (ml6team)** | Model | ControlNet fine-tuned on 130k interior images from LAION5B. 15 room types, 30 design styles. Segmentation-conditioned | HuggingFace Space | Stable | Free (open-weight) | Medium |
| **controlnet-seg-room** | Model | ControlNet trained specifically for room segmentation-guided generation | HuggingFace | Stable | Free | Medium |

---

## 2. Segmentation

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **SAM 2 (Segment Anything Model 2)** | Library | Meta's universal segmentation model. Click/prompt any object to segment. 44 FPS real-time. Images + video | 15k+ GitHub | Mature | Free (Apache 2.0) | Medium |
| **SAM 3** | Library | SAM 3 with concepts. Powers "View in Room" feature on Facebook Marketplace for home decor visualization | Recent release | Early/Stable | Free | Medium |
| **OneFormer (ADE20K)** | Library | Universal image segmentation: semantic, instance, panoptic. ADE20K has 150 classes including furniture, walls, floors | 1.5k+ GitHub | Mature (CVPR 2023) | Free (MIT) | Medium |
| **UperNet Semantic Segmentation** | Library | HuggingFace semantic segmentation model. Used by ml6team ControlNet pipeline for room segmentation maps | HuggingFace | Mature | Free | Easy (transformers) |
| **Grounded-SAM-2** | Library | Combines GroundingDINO + SAM 2 for open-vocabulary segmentation. Text prompt -> segment anything | 5k+ GitHub | Stable | Free | Hard |

---

## 3. Depth Estimation

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **Depth Anything V2** | Library | State-of-the-art monocular depth estimation. 97.1% accuracy, 213ms inference (Large). Outperforms MiDaS | 5k+ GitHub | Mature | Free (Apache 2.0) | Easy (pip) |
| **ZoeDepth** | Library | Metric depth estimation combining MiDaS + metric binning. Zero-shot transfer. Variants: ZoeD_N, ZoeD_K, ZoeD_NK | 2k+ GitHub | Mature | Free | Medium |
| **MiDaS** | Library | Robust monocular depth estimation. Multiple model sizes. Trained on 10 datasets. PyTorch Hub available | 4.5k+ GitHub | Mature/Legacy | Free (MIT) | Easy (torch.hub) |
| **Marigold** | Library | Diffusion-based depth estimation (fine-tuned from SD 2). CVPR 2024 Oral. v1.1 released May 2025. Up to 4MP resolution | 4k+ GitHub | Mature | Free | Medium (diffusers) |

---

## 4. Image Enhancement & Inpainting

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **Real-ESRGAN** | Library/API | 4x image super-resolution. Practical algorithms for real-world image/video restoration. Removes artifacts | 29k+ GitHub | Mature | Free (BSD-3); API via Replicate | Easy (pip) |
| **LaMa** | Library | Large Mask Inpainting with Fourier Convolutions. Furniture removal from rooms. Resolution-robust | 8k+ GitHub | Mature (WACV 2022) | Free | Medium |
| **Lama Cleaner (IOPaint)** | Library/CLI | UI wrapper around LaMa + SD inpainting. Remove objects, defects, people. Erase & replace | 20k+ GitHub | Mature | Free (Apache 2.0) | Easy (pip) |
| **Simple-LaMa** | Library | Minimal LaMa implementation. Few lines of code. CPU + GPU. HuggingFace Hub integration | 500+ GitHub | Stable | Free | Easy |
| **Inpaint-Anything** | Library | SAM + LaMa combined: click to remove objects. Zero-shot inpainting | 6k+ GitHub | Stable | Free | Medium |
| **GFPGAN** | Library | Face restoration and enhancement. Often combined with Real-ESRGAN | 36k+ GitHub | Mature | Free | Easy |

---

## 5. Style Transfer / CLIP / IP-Adapter

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **OpenAI CLIP** | Library | Contrastive Language-Image Pre-training. Maps text & images to same embedding space. Style classification, similarity | 26k+ GitHub | Mature | Free (MIT) | Easy (pip) |
| **IP-Adapter** | Library | Image Prompt Adapter for SD. Style transfer from reference images. 22M params. Decoupled cross-attention | 6k+ GitHub | Mature | Free | Medium |
| **IP-Adapter FaceID** | Library | Face-consistent generation across styles. Portrait consistency. FaceID-Plus for SDXL | Part of IP-Adapter repo | Stable | Free | Medium |
| **IP-Adapter Plus** | Library | Enhanced style transfer with higher fidelity. Fine-tuned for face/style reference | Part of IP-Adapter repo | Stable | Free | Medium |
| **HuggingFace CLIP** | Library | CLIP via `transformers` library. CLIPProcessor + CLIPModel. Easier setup than OpenAI's CLIP | HuggingFace Hub | Mature | Free | Easy |

---

## 6. Lighting & Relighting

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **IC-Light** | Library | "Imposing Consistent Light" by Lvmin Zhang. Text-conditioned and background-conditioned relighting. Normal map generation | 5k+ GitHub | Stable | Free | Medium |
| **IC-Light V2** | API | Advanced version available on fal.ai. Pro lighting control for images | fal.ai hosted | Stable | Paid (fal.ai pricing) | Easy (API) |

---

## 7. LLM for Chat (Vision + NLP)

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **Claude API (Anthropic)** | API | Vision + text. Image analysis, design interpretation, chat. Haiku ($1/$5), Sonnet ($3/$15), Opus ($5/$25) per MTok | N/A (commercial) | Mature | Paid; caching can reduce costs 90% | Easy (REST/SDK) |
| **GPT-4o / GPT-5 (OpenAI)** | API | Vision + text. Image understanding, design suggestions. GPT-4o: $2.50/$10 per MTok (being deprecated for GPT-5) | N/A (commercial) | Mature | Paid | Easy (REST/SDK) |
| **Google Gemini** | API | Multimodal. Image generation (Imagen 3), vision, chat. Free tier available | N/A (commercial) | Mature | Free tier + paid | Easy |

---

## 8. Object Detection (Open Vocabulary)

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **GroundingDINO** | Library | Open-set object detection. Text prompt -> bounding boxes. "Find sofa, table, lamp" -> detects all | 7k+ GitHub | Mature (ECCV 2024) | Free | Medium |
| **Grounding DINO 1.5** | API | Most capable open-world detection. API via DDS Cloud. V2 released April 2025 | GitHub (API repo) | Stable | Free (API) | Easy |
| **Grounded-SAM-2** | Library | GroundingDINO + SAM 2. Detect + Segment + Track any object by text description | 5k+ GitHub | Stable | Free | Hard |

---

## 9. GPU Inference Platforms

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **Replicate** | API Platform | Run ML models via API. Largest model marketplace. Acquired by Cloudflare 2025 | $200M+ ARR estimate | Mature | Pay-per-second; ~$0.002/image for SDXL | Easy |
| **fal.ai** | API Platform | Fastest serverless GPU inference. 4x faster FLUX. 600+ models. $200M ARR (Oct 2025) | $4.5B valuation | Mature | FLUX.2 Pro: $0.03/MP; Dev: $0.012/MP. Free tier | Easy |
| **Modal.com** | API Platform | Serverless Python GPU. Code-first (no YAML). Sub-second cold starts. Auto-scaling to thousands of GPUs | Growing fast | Mature | Pay-per-second GPU; scales to zero | Medium |
| **RunPod** | API Platform | Serverless GPU. Docker containers. 48% cold starts <200ms. FlashBoot optimization | 200k+ users | Mature | Pay-per-second; 20-30% savings with active workers; $0.10/GB/month storage | Medium |
| **HuggingFace Inference Endpoints** | API Platform | Deploy any HF model. Dedicated or serverless. Inference Providers for routed access | Largest ML community | Mature | Dedicated: $0.03-$80/hr; Serverless: pay per compute | Easy |
| **HuggingFace Inference Providers** | API Platform | Serverless inference across providers. Python/JS SDKs. No infrastructure management | Same as above | Mature | Free tier + pay-per-use | Easy |
| **Stability AI API** | API | Official Stability AI hosted inference. Generate, edit, upscale | N/A | Mature | Credits-based; SDXL ~$0.002-0.006/img | Easy |

---

## 10. ComfyUI Ecosystem

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **ComfyUI** | CLI/Library | Node-based image generation workflow. WebSocket API for real-time updates. FastAPI-compatible | 65k+ GitHub | Mature | Free (GPL-3.0) | Medium |
| **comfyui-python-api** | Library | Python SDK for ComfyUI API. Run workflows, callbacks, progress updates | 300+ GitHub | Stable | Free | Easy |
| **Comfyui_api_client** | Library | Sync + async Python client for ComfyUI API | GitHub | Stable | Free | Easy |
| **comfy-api-simplified** | Library (PyPI) | Small Python wrapper. Edit API-format workflows, queue programmatically | PyPI | Stable | Free | Easy |
| **ComfyUI-to-Python-Extension** | Library | Translates visual ComfyUI workflows into executable Python code | 1.5k+ GitHub | Stable | Free | Easy |
| **ViewComfy** | API Platform | Hosted ComfyUI workflows as APIs/apps. No code required. API endpoints ready | SaaS | Mature | Studio: $200/month; Pro: custom; Free trial | Easy |
| **RunComfy** | API Platform | Cloud ComfyUI with fast GPUs. Scalable API | SaaS | Mature | Subscription-based | Easy |
| **Comfy Cloud** | API Platform | Official ComfyUI cloud offering. Beta | SaaS | Beta | Usage-based | Easy |

---

## 11. Payment Gateways (Brazil)

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **Asaas** | API | Brazilian payment gateway. PIX, boleto, credit card, tokenization, split payments, recurring, anticipation. Well-documented REST API | Major BR player | Mature | Transaction fees; API access free | Easy |
| **Pagar.me** | API/SDK | Brazilian payment gateway (StoneCo). PIX, boleto, credit/debit cards, digital wallets. Official Node.js SDK (`@pagarme/sdk`) | npm package | Mature | Transaction fees | Easy |
| **Stripe (Brazil)** | API | Global gateway with BR support. PIX (via EBANX partnership), Boleto, cards. Pix Automatico (recurring) since 2025. Auto-handles payment methods | Global leader | Mature | Standard Stripe fees + BR transaction costs | Easy |
| **Woovi / OpenPix** | API | PIX-first Brazilian gateway. REST API, webhooks, SDKs (Java, Node, PHP, Ruby). Pix Qubit innovation | Growing fast in BR | Mature | Transaction fees | Easy |

---

## 12. Real Estate Portals (Brazil)

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **ZAP Imoveis** | Scraper/API | Largest Brazilian real estate portal. No official public API. Data available via Apify scraper. DataZap AVM API for pricing | Largest in BR | N/A (scraping) | Apify subscription for scraping; DataZap pricing for AVM | Medium |
| **QuintoAndar** | Scraper/API | Major Brazilian proptech. No official public developer API. Apify scraper available for property data extraction | Top 3 in BR | N/A (scraping) | Apify subscription | Medium |
| **OLX Brasil Imoveis** | Scraper/API | Massive classified listings. No official API. Multiple Apify scrapers. Brazil Real Estate Scraper covers OLX + QuintoAndar + ImovelWeb + Airbnb | Huge in BR | N/A (scraping) | Apify subscription | Medium |
| **ImovelWeb** | Scraper | Brazilian real estate listings. Part of multi-platform scrapers on Apify | Major portal | N/A (scraping) | Apify subscription | Medium |
| **Apify (BR Real Estate bundle)** | API Platform | Unified scraper platform covering ZAP, QuintoAndar, OLX, ImovelWeb, Airbnb across 27 Brazilian states | 13k+ GitHub (platform) | Mature | Pay-per-use; plans available | Easy |

---

## 13. MCP Servers (Claude Integration)

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **mcp-server-stability-ai** | MCP Server | Stability AI integration for Claude. Generate, edit, upscale, remove background. Chain manipulations in conversation | GitHub (tadasant) | Stable | Free (needs Stability AI key) | Easy |
| **Image-Generation-MCP-Server** | MCP Server | Replicate FLUX model integration for Claude Desktop. Text-to-image via MCP | GitHub (GongRzhe) | Stable | Free (needs Replicate key) | Easy |
| **fal-mcp-server** | MCP Server | 600+ AI models via fal.ai in Claude. FLUX, SD, MusicGen. Image/video/audio generation | GitHub | Stable | Free (needs fal.ai key) | Easy |
| **PromptShopMCP** | MCP Server | AI image editing in Claude Desktop. Uses Gemini + RemoveBG | GitHub | Early | Free (needs API keys) | Easy |
| **mcp-image (Gemini)** | MCP Server | Image generation/editing via Gemini. Auto prompt optimization. Quality presets | GitHub (shinpr) | Stable | Free (needs Gemini key) | Easy |
| **OLX Search Scraper MCP** | MCP Server | OLX real estate data scraping via MCP in Claude | Apify | Stable | Paid (Apify) | Easy |

---

## 14. Turnkey Virtual Staging APIs

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **Decor8 AI API** | API/SDK | AI interior design + virtual staging. SDKs: Python, JavaScript, Dart, Flutter. 56+ styles. Open-source SDK. WordPress/Wix plugins | 50k+ users | Mature | Subscription + API credits | Easy |
| **SofaBrain Pro API** | API | Interior design transformation. 27+ styles, 50+ room types. REST API with webhooks. 65% faster client approvals reported | Growing | Mature | Pro subscription required; custom pricing for API | Easy |
| **Gepetto API** | API | Virtual staging + redesign AI. REST API + SDKs. 95%+ style recognition accuracy. 15-30s per transformation. Webhook support | Growing | Mature | Free trial (50 API calls); subscription plans | Easy |
| **RoomGPT** | API/App | Open-source room redesign with AI. Based on ControlNet | GitHub (open-source) | Stable | Free (self-hosted) | Medium |

---

## 15. Infrastructure & Storage

| Name | Category | Purpose | Stars/Popularity | Maturity | Cost | Integration |
|------|----------|---------|-----------------|----------|------|-------------|
| **Supabase Storage** | API/Platform | Image upload, storage, CDN. Edge Functions for processing. Image transformations. Real-time. Next.js integration | 75k+ GitHub | Mature | Free tier; Pro: $25/mo | Easy |
| **Supabase Edge Functions** | API/Platform | Serverless compute at edge. Image processing workflows. Low-latency execution | Part of Supabase | Mature | Included with Supabase plan | Easy |

---

## Architecture Recommendation Summary

### Tier 1: Core AI Pipeline (Build In-House)
| Component | Recommended Stack | Why |
|-----------|------------------|-----|
| **Image Generation** | FLUX.2 via fal.ai OR ComfyUI + ControlNet on Modal/RunPod | Best quality + cost balance |
| **Room Segmentation** | SAM 2 + OneFormer (ADE20K) | Best room-specific segmentation |
| **Depth Estimation** | Depth Anything V2 OR Marigold | Best accuracy + speed |
| **Furniture Removal** | LaMa (Inpaint-Anything) | Open source, proven results |
| **Style Transfer** | IP-Adapter + CLIP | Reference image to new design |
| **Enhancement** | Real-ESRGAN | 4x upscale for final output |
| **Relighting** | IC-Light | Consistent lighting in generated rooms |
| **Object Detection** | GroundingDINO + SAM 2 | Find & segment furniture by text |

### Tier 2: Platform & Integration
| Component | Recommended | Why |
|-----------|------------|-----|
| **GPU Inference** | fal.ai (primary) + Modal (custom) | Speed + flexibility |
| **LLM Chat** | Claude API (Sonnet) | Best vision + value balance |
| **Payments** | Stripe (global) + Asaas (BR-specific) | Full BR coverage + global |
| **Real Estate Data** | Apify (ZAP + OLX + QuintoAndar bundle) | All major portals |
| **Storage** | Supabase Storage + Edge Functions | Full-stack, real-time |
| **ComfyUI Workflows** | ViewComfy OR self-hosted on Modal | Production-ready API |

### Tier 3: MCP Integration (Claude Code/Desktop)
| Component | Recommended |
|-----------|------------|
| **Image Generation** | mcp-server-stability-ai + fal-mcp-server |
| **Real Estate Data** | OLX Search Scraper MCP (via Apify) |

---

## Cost Estimation (Per Image Generation)

| Approach | Cost/Image | Latency | Quality |
|----------|-----------|---------|---------|
| fal.ai FLUX.2 Pro | ~$0.03 | 2-5s | Excellent |
| fal.ai FLUX.2 Dev | ~$0.012 | 3-8s | Very Good |
| Replicate SDXL | ~$0.002-0.006 | 5-15s | Good |
| Stability AI SDXL | ~$0.002-0.006 | 3-10s | Good |
| Self-hosted (Modal/RunPod) | ~$0.001-0.005 | Variable | Full control |
| Decor8 AI API (turnkey) | ~$0.10-0.50 | 15-30s | Production-ready |
| SofaBrain API (turnkey) | Custom pricing | 10-20s | Production-ready |

---

## Sources

### Image Generation
- [Replicate SDXL](https://replicate.com/stability-ai/sdxl)
- [Replicate ControlNet Collection](https://replicate.com/collections/control-net)
- [Stability AI Developer Platform](https://platform.stability.ai/pricing)
- [Stability AI API Pricing Update 2025](https://stability.ai/api-pricing-update-25)
- [AUTOMATIC1111 WebUI API Wiki](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API)
- [Black Forest Labs (FLUX)](https://bfl.ai/)
- [FLUX.2 GitHub](https://github.com/black-forest-labs/flux2)
- [ControlNet Interior Design (ml6team)](https://huggingface.co/spaces/ml6team/controlnet-interior-design)
- [controlnet-seg-room (HuggingFace)](https://huggingface.co/BertChristiaens/controlnet-seg-room)
- [Open-Source AI Image Generation Models 2026](https://www.pixazo.ai/blog/top-open-source-image-generation-models)

### Segmentation
- [Segment Anything Model 2 (Meta)](https://ai.meta.com/sam2/)
- [SAM 3 (Meta)](https://ai.meta.com/blog/segment-anything-model-3/)
- [SAM GitHub](https://github.com/facebookresearch/segment-anything)
- [OneFormer GitHub](https://github.com/SHI-Labs/OneFormer)
- [OneFormer ADE20K (HuggingFace)](https://huggingface.co/shi-labs/oneformer_ade20k_swin_large)

### Depth Estimation
- [Depth Anything V2 (DeepWiki)](https://deepwiki.com/DepthAnything/Depth-Anything-V2/4.1-python-api)
- [ZoeDepth GitHub](https://github.com/isl-org/ZoeDepth)
- [MiDaS GitHub](https://github.com/isl-org/MiDaS)
- [Marigold GitHub](https://github.com/prs-eth/Marigold)
- [Marigold HuggingFace](https://huggingface.co/prs-eth/marigold-depth-v1-1)

### Enhancement & Inpainting
- [Real-ESRGAN GitHub](https://github.com/xinntao/Real-ESRGAN)
- [LaMa GitHub](https://github.com/advimman/lama)
- [Simple-LaMa GitHub](https://github.com/okaris/simple-lama)
- [Inpaint-Anything GitHub](https://github.com/geekyutao/Inpaint-Anything)

### Style Transfer / CLIP
- [OpenAI CLIP GitHub](https://github.com/openai/CLIP)
- [IP-Adapter GitHub](https://github.com/tencent-ailab/IP-Adapter)
- [IP-Adapter HuggingFace](https://huggingface.co/h94/IP-Adapter)
- [CLIP HuggingFace Docs](https://huggingface.co/docs/transformers/model_doc/clip)

### Lighting
- [IC-Light GitHub](https://github.com/lllyasviel/IC-Light)
- [IC-Light V2 on fal.ai](https://fal.ai/models/fal-ai/iclight-v2)

### LLM APIs
- [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [OpenAI API Pricing](https://platform.openai.com/docs/pricing)

### Object Detection
- [GroundingDINO GitHub](https://github.com/IDEA-Research/GroundingDINO)
- [Grounding DINO 1.5 API](https://github.com/IDEA-Research/Grounding-DINO-1.5-API)
- [Grounded-SAM-2 GitHub](https://github.com/IDEA-Research/Grounded-SAM-2)

### GPU Platforms
- [fal.ai](https://fal.ai/)
- [fal.ai Pricing](https://fal.ai/pricing)
- [Modal.com](https://modal.com/)
- [RunPod Serverless](https://www.runpod.io/product/serverless)
- [RunPod Pricing](https://docs.runpod.io/serverless/pricing)
- [Replicate Pricing](https://replicate.com/pricing)
- [HuggingFace Inference Endpoints](https://endpoints.huggingface.co/)
- [HuggingFace Pricing](https://huggingface.co/pricing)

### ComfyUI Ecosystem
- [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI)
- [comfyui-python-api GitHub](https://github.com/andreyryabtsev/comfyui-python-api)
- [Comfyui_api_client GitHub](https://github.com/sugarkwork/Comfyui_api_client)
- [comfy-api-simplified (PyPI)](https://pypi.org/project/comfy-api-simplified/)
- [ComfyUI-to-Python-Extension GitHub](https://github.com/pydn/ComfyUI-to-Python-Extension)
- [ViewComfy](https://www.viewcomfy.com)
- [ViewComfy Pricing](https://www.viewcomfy.com/pricing)
- [Comfy Cloud](https://www.comfy.org/cloud)

### Payment Gateways
- [Asaas Documentation](https://docs.asaas.com/)
- [Asaas Developer Portal](https://www.asaas.com/desenvolvedores)
- [Pagar.me Node.js SDK](https://github.com/pagarme/pagarme-nodejs-sdk)
- [Pagar.me Documentation](https://docs.pagar.me/)
- [Stripe PIX Payments](https://docs.stripe.com/payments/pix)
- [Stripe Boleto Payments](https://docs.stripe.com/payments/boleto)
- [Woovi Developer Docs](https://developers.woovi.com/en/)

### Real Estate Portals
- [ZAP Imoveis Scraper (Apify)](https://apify.com/avorio/zap-imoveis-scraper/api/cli)
- [QuintoAndar Scraper (Apify)](https://apify.com/brasil-scrapers/quinto-andar-api)
- [OLX Brasil Imoveis Scraper (Apify)](https://apify.com/israeloriente/olx-brasil-imoveis-scraper/api)
- [Brazil Real Estate Scraper (4 Platforms)](https://apify.com/viralanalyzer/brazil-real-estate-scraper)
- [DataZap Intelligence](https://www.datazap.com.br/en/)

### MCP Servers
- [mcp-server-stability-ai GitHub](https://github.com/tadasant/mcp-server-stability-ai)
- [Image-Generation-MCP-Server GitHub](https://github.com/GongRzhe/Image-Generation-MCP-Server)
- [fal-mcp-server (Glama)](https://glama.ai/mcp/servers/enescanguven/fal-mcp)
- [PromptShopMCP GitHub](https://github.com/Kira-Pgr/PromptShopMCP)
- [mcp-image GitHub](https://github.com/shinpr/mcp-image)

### Turnkey Virtual Staging APIs
- [Decor8 AI API](https://www.decor8.ai/ai-virtual-staging-api)
- [Decor8 AI SDK GitHub](https://github.com/immex-tech/decor8ai-sdk)
- [SofaBrain Pro API](https://sofabrain.com/pro-api/)
- [Gepetto API](https://gepettoapp.com/en/api)
- [Gepetto API Docs](https://docs.gepettoapp.com/)
- [Interior AI](https://interiorai.com/)
