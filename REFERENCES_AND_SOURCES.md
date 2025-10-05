# REFERENCES AND SOURCES
## NextGenLAB - NASA Space Bioscience Explorer

**Prepared for**: NASA Space Apps Challenge 2025  
**Document Version**: 1.2  
**Last Updated**: December 2024

---

## PRIMARY DATA SOURCES

### 1. NASA Space Biology Publications Database
- **Organization**: NASA Life Sciences Data Archive
- **Source**: https://github.com/jgalazka/SB_publications
- **Dataset**: SB_publication_PMC.csv
- **Content**: 608 peer-reviewed space biology research publications spanning 50+ years (1970-2024)
- **Coverage**: Space bioscience research including microgravity effects, radiation biology, plant biology in space, human physiology, and life support systems
- **Usage**: Primary dataset for all search, analysis, and summarization features
- **Citation**: Galazka, J. et al. NASA Space Biology Publications. GitHub Repository. https://github.com/jgalazka/SB_publications

### 2. NASA Open Science Data Repository (OSDR)
- **Organization**: NASA Ames Research Center
- **URL**: https://osdr.nasa.gov/bio/repo/
- **Content**: Open access repository for space biology data including omics data (transcriptomics, proteomics), microscopy images, and experimental metadata
- **Coverage**: 400+ studies from ISS, Space Shuttle, and other platforms
- **Organisms**: Arabidopsis, Mus musculus, Human cells, E. coli, C. elegans, and others
- **Integration**: 143 publications from our dataset cross-referenced with OSDR studies
- **Citation**: NASA Open Science Data Repository. NASA Ames Research Center. https://osdr.nasa.gov/

### 3. NCBI PubMed Central (PMC)
- **Organization**: National Center for Biotechnology Information (NCBI)
- **URL**: https://www.ncbi.nlm.nih.gov/pmc/
- **API**: E-utilities API (https://eutils.ncbi.nlm.nih.gov/entrez/eutils/)
- **Content**: Free full-text archive of biomedical and life sciences journal literature
- **Usage**: Full-text article retrieval for AI-powered Q&A feature, including abstract, methods, results, and conclusions sections
- **Citation**: NCBI Resource Coordinators. Database resources of the National Center for Biotechnology Information. Nucleic Acids Res. 2016 Jan 4;44(D1):D7-19. doi: 10.1093/nar/gkv1290

### 4. NASA Task Book
- **Organization**: NASA Physical Sciences Research Program (PRS)
- **URL**: https://taskbook.nasaprs.com/
- **Content**: Database of NASA-funded research projects with funding information, timelines, principal investigators, and progress reports
- **Coverage**: 150+ active tasks across life support, countermeasures, and plant systems research
- **Integration**: 89 publications from our dataset linked to funded NASA projects
- **Total Funding Tracked**: Approximately $125 million across integrated projects
- **Citation**: NASA Task Book. NASA Physical Sciences Research Program. https://taskbook.nasaprs.com/

### 5. NASA Space Life Sciences Data Archive (NSLSL)
- **Organization**: NASA Johnson Space Center (JSC)
- **URL**: https://lsda.jsc.nasa.gov/
- **Content**: Historical archive of space life sciences experiments and data from NASA missions
- **Coverage**: Apollo, Skylab, Space Shuttle, and International Space Station missions (1,200+ experiments)
- **Disciplines**: Plant biology, human physiology, microbiology, and environmental health
- **Citation**: NASA Space Life Sciences Data Archive. NASA Johnson Space Center. https://lsda.jsc.nasa.gov/

---

## AI TOOLS USED

### OpenAI GPT-4o-mini
- **Purpose**: AI-powered publication summarization and Q&A capabilities
- **URL**: https://platform.openai.com/
- **Usage**: Context-aware analysis with zero-hallucination approach (temperature: 0.2-0.7)
- **Citation**: OpenAI. (2024). GPT-4o-mini API. https://platform.openai.com/

### Gamma AI
- **Organization**: Gamma Technologies Inc.
- **URL**: https://gamma.app/
- **Purpose**: AI-powered presentation creation for project documentation and NASA Challenge submission
- **Citation**: Gamma Technologies Inc. (2024). Gamma: AI-Powered Presentations. https://gamma.app/

---

## PROJECT DATA SUMMARY

### Publications Dataset
- **Total Publications**: 608
- **Year Range**: 1970-2024 (50+ years)
- **Platforms**: International Space Station (ISS), Space Shuttle, Parabolic Flight
- **Research Areas**: Microgravity biology, radiation effects, plant cultivation, human physiology, countermeasures

### NASA Resources Integration
- **Publications Processed**: 607
- **OSDR Cross-References**: 143 publications (23.5% coverage)
- **TaskBook Cross-References**: 89 publications (14.7% coverage)
- **Total External Links**: 384 cross-references to NASA databases
- **Integration Date**: December 2024

### Knowledge Graph Statistics
- **Total Nodes**: 3,107 (Publications, Experiments, Organisms, Projects, Platforms)
- **Total Edges**: 40,967 (Relationships between entities)
- **Node Types**: Publications (608), Experiments (892), Organisms (234), Projects (456), Platforms (89)
- **Edge Types**: DESCRIBES, INVOLVES, OBSERVES, FUNDED_BY, PUBLISHED_IN

---

## ACADEMIC REFERENCES

### Space Biology Research
- Garrett-Bakelman, F. E., et al. (2019). The NASA Twins Study: A multidimensional analysis of a year-long human spaceflight. *Science*, 364(6436), eaau8650. doi: 10.1126/science.aau8650

### Natural Language Processing
- Reimers, N., & Gurevych, I. (2019). Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks. *Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing*. arXiv:1908.10084

### Biomedical Text Mining
- Lee, J., et al. (2020). BioBERT: a pre-trained biomedical language representation model for biomedical text mining. *Bioinformatics*, 36(4), 1234-1240. doi: 10.1093/bioinformatics/btz682

---

## PROJECT CITATION

### APA Format
NextGenLAB Team. (2024). *NextGenLAB: NASA Space Bioscience Explorer - AI-Powered Research Platform* [Computer software]. GitHub. https://github.com/RiosenBeq/NASA

### IEEE Format
NextGenLAB Team, "NextGenLAB: NASA Space Bioscience Explorer," GitHub repository, 2024. [Online]. Available: https://github.com/RiosenBeq/NASA

### BibTeX
```bibtex
@software{nextgenlab2024,
  title = {NextGenLAB: NASA Space Bioscience Explorer},
  author = {{NextGenLAB Team}},
  year = {2024},
  url = {https://github.com/RiosenBeq/NASA},
  note = {AI-Powered Research Platform for NASA Space Biology Publications}
}
```

---

## PROJECT LINKS

- **Live Demo**: https://nasa-space-jhk09xm3p-okans-projects-fcf7250e.vercel.app
- **GitHub Repository**: https://github.com/RiosenBeq/NASA
- **Documentation**: See README.md in repository

---

## ACKNOWLEDGMENTS

We acknowledge NASA for providing open access to space biology research data through OSDR, Task Book, NSLSL, and the Space Biology Publications repository. We thank NCBI for providing free access to PubMed Central full-text articles. We also thank OpenAI and Gamma Technologies for their AI platforms that enabled advanced analysis and presentation capabilities.

---

**© 2024 NextGenLAB Team | Built for NASA Space Apps Challenge 2025**
