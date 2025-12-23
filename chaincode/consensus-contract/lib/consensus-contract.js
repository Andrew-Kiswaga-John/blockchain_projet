'use strict';

const { Contract } = require('fabric-contract-api');

/**
 * ConsensusContract - Smart Contract for Consensus Experimentation
 * 
 * Implements 3 modes of consensus simulation:
 * 1. Raft (Baseline): Standard Fabric behavior
 * 2. PoA (Proof of Authority): Identity-based validation
 * 3. PBFT (Byzantine Fault Tolerance): Multi-sig voting simulation
 */
class ConsensusContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Consensus Ledger ===========');
        console.info('============= END : Initialize Consensus Ledger ===========');
    }

    /**
     * ===============================================
     * MODE A: RAFT (BASELINE)
     * ===============================================
     * Simulates standard Fabric behavior where we trust the ordering service.
     * 
     * @param {Context} ctx
     * @param {string} id - Unique identifier
     * @param {string} data - Arbitrary data
     */
    async submitRaft(ctx, id, data) {
        console.info(`[RAFT] Processing transaction ${id}`);

        const record = {
            id,
            data,
            consensusType: 'RAFT',
            status: 'FINALIZED', // Raft effectively finalizes on commit
            timestamp: ctx.stub.getTxTimestamp().seconds.low,
            creator: ctx.clientIdentity.getMSPID()
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(record)));
        return JSON.stringify(record);
    }

    /**
     * ===============================================
     * MODE B: PROOF OF AUTHORITY (PoA)
     * ===============================================
     * Centralized consensus. Only 'TrafficAuthorityMSP' can finalize data.
     * Others will be rejected.
     * 
     * @param {Context} ctx
     * @param {string} id - Unique identifier
     * @param {string} data - Arbitrary data
     */
    async submitPoA(ctx, id, data) {
        console.info(`[PoA] Processing transaction ${id}`);

        const mspId = ctx.clientIdentity.getMSPID();

        // AUTHORITY CHECK
        if (mspId !== 'TrafficAuthorityMSP') {
            throw new Error(`CONSENSUS ERROR: PoA Validation Failed. ${mspId} is not authorized. Only TrafficAuthorityMSP can submit.`);
        }

        const record = {
            id,
            data,
            consensusType: 'PoA',
            status: 'FINALIZED',
            timestamp: ctx.stub.getTxTimestamp().seconds.low,
            creator: mspId
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(record)));
        return JSON.stringify(record);
    }

    /**
     * ===============================================
     * MODE C: MODIFIED PBFT (VOTING)
     * ===============================================
     * Decentralized consensus. Requires 2/3 majority vote to finalize.
     */

    /**
     * Step 1: Propose a change
     * 
     * @param {Context} ctx
     * @param {string} proposalId - Unique proposal ID
     * @param {string} data - Proposed data
     */
    async submitPBFTProposal(ctx, proposalId, data) {
        console.info(`[PBFT] New Proposal ${proposalId}`);

        const mspId = ctx.clientIdentity.getMSPID();

        // Check if exists
        const exists = await ctx.stub.getState(proposalId);
        if (exists && exists.length > 0) {
            throw new Error(`Proposal ${proposalId} already exists`);
        }

        const proposal = {
            proposalId,
            data,
            consensusType: 'PBFT',
            status: 'PENDING', // Waiting for votes
            creator: mspId,
            votes: {}, // Map of MSP -> Vote
            voteCount: 1, // Proposer automatically votes
            requiredVotes: 3, // Hardcoded for this experiment (Total 4 orgs -> 2/3 ≈ 3)
            timestamp: ctx.stub.getTxTimestamp().seconds.low
        };

        // Proposer votes for themselves
        proposal.votes[mspId] = true;

        await ctx.stub.putState(proposalId, Buffer.from(JSON.stringify(proposal)));

        // Emit event for voters to listen to
        ctx.stub.setEvent('PBFTProposalCreated', Buffer.from(JSON.stringify({ proposalId, creator: mspId })));

        return JSON.stringify(proposal);
    }

    /**
     * Step 2: Vote on a proposal
     * 
     * @param {Context} ctx
     * @param {string} proposalId - Unique proposal ID
     */
    async votePBFT(ctx, proposalId) {
        console.info(`[PBFT] Vote received for ${proposalId}`);

        const mspId = ctx.clientIdentity.getMSPID();

        const proposalBytes = await ctx.stub.getState(proposalId);
        if (!proposalBytes || proposalBytes.length === 0) {
            throw new Error(`Proposal ${proposalId} does not exist`);
        }

        const proposal = JSON.parse(proposalBytes.toString());

        if (proposal.status === 'FINALIZED') {
            return JSON.stringify({ message: 'Already Finalized', proposal });
        }

        // Check double voting
        if (proposal.votes[mspId]) {
            throw new Error(`Organization ${mspId} has already voted on ${proposalId}`);
        }

        // Record vote
        proposal.votes[mspId] = true;
        proposal.voteCount = Object.keys(proposal.votes).length;

        console.info(`[PBFT] Vote Count for ${proposalId}: ${proposal.voteCount}/${proposal.requiredVotes}`);

        // Check consensus threshold
        if (proposal.voteCount >= proposal.requiredVotes) {
            proposal.status = 'FINALIZED';
            console.info(`[PBFT] Consensus Reached for ${proposalId}`);

            // Emit Finalization Event
            ctx.stub.setEvent('ConsensusFinalized', Buffer.from(JSON.stringify({
                proposalId,
                finalTimeStamp: ctx.stub.getTxTimestamp().seconds.low
            })));
        } else {
            ctx.stub.setEvent('PBFTVoteReceived', Buffer.from(JSON.stringify({
                proposalId,
                voter: mspId,
                currentVotes: proposal.voteCount
            })));
        }

        await ctx.stub.putState(proposalId, Buffer.from(JSON.stringify(proposal)));
        return JSON.stringify(proposal);
    }

    /**
     * Query state
     */
    async queryConsensusState(ctx, id) {
        const bytes = await ctx.stub.getState(id);
        if (!bytes || bytes.length === 0) {
            throw new Error(`${id} does not exist`);
        }
        return bytes.toString();
    }
}

module.exports = ConsensusContract;
