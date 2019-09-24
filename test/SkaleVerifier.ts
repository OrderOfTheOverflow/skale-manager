import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { SkaleVerifierContract,
         SkaleVerifierInstance} from "../types/truffle-contracts";

import { gasMultiplier } from "./utils/command_line";
import { skipTime } from "./utils/time";

const SkaleVerifier: SkaleVerifierContract = artifacts.require("./SkaleVerifier");

import BigNumber from "bignumber.js";
chai.should();
chai.use(chaiAsPromised);

contract("SkaleVerifier", ([owner, validator, developer, hacker]) => {
    let skaleVerifier: SkaleVerifierInstance;

    beforeEach(async () => {
        skaleVerifier = await SkaleVerifier.new({from: owner, gas: 8000000 * gasMultiplier});
    });

    describe("when skaleVerifier contract is activated", async () => {
        it("should verify valid signatures with valid data", async() => {
            // const signa = new BigNumber("12246224789371979764448582489488838691424696526644556990733838563729335147344");
            // const signb = new BigNumber("10528945047297938115197671113541113701111057011888716549967014037021507698430");
            //
            // const hash = "0x3733cd977ff8eb18b987357e22ced99f46097f31ecb239e878ae63760e83e4d5";
            //
            // const counter = 2;
            //
            // const hasha = new BigNumber("8330398017606383362778967296125384542293285683930042644463579736059414477560");
            // const hashb = new BigNumber("15983567607269484412063625758442416507299349120463367396521067445601767939624");
            //
            // const pkx1 = new BigNumber("7400107192966145181399535745499335165347120346963667754929581055788152472106");
            // const pky1 = new BigNumber("18353520504408127630771487258260700969877478367957411410017068328387547117081");
            // const pkx2 = new BigNumber("4917434737461214318927199341232485422238948576908897268618382214023701714282");
            // const pky2 = new BigNumber("15295158583345622866054024228469218054851674208376922650223378778985088227953");

            //const isVerified = await skaleVerifier.verify(signa, signb, hash, counter, hasha, hashb, pkx1, pky1, pkx2, pky2);
            const isVerified = await skaleVerifier.verify("178325537405109593276798394634841698946852714038246117383766698579865918287",
                                                          "493565443574555904019191451171395204672818649274520396086461475162723833781",
                                                          "0x3733cd977ff8eb18b987357e22ced99f46097f31ecb239e878ae63760e83e4d5",
                                                          0,
                                                          "3080491942974172654518861600747466851589809241462384879086673256057179400078",
                                                          "15163860114293529009901628456926790077787470245128337652112878212941459329347",
                                                          "12500085126843048684532885473768850586094133366876833840698567603558300429943",
                                                          "8276253263131369565695687329790911140957927205765534740198480597854608202714",
                                                          "14411459380456065006136894392078433460802915485975038137226267466736619639091",
                                                          "7025653765868604607777943964159633546920168690664518432704587317074821855333");

            assert(isVerified.should.be.true);
        });

        it("should not verify invalid signature", async() => {
          let isExceptionCaught = false;
          try {
              await skaleVerifier.verify("178325537405109593276798394634841698946852714038246117383766698579865918287",
                                        "493565443574555904019191451171395204672818649274520396086461475162723833782",  // the last digit is spoiled
                                        "0x3733cd977ff8eb18b987357e22ced99f46097f31ecb239e878ae63760e83e4d5",
                                        0,
                                        "3080491942974172654518861600747466851589809241462384879086673256057179400078",
                                        "15163860114293529009901628456926790077787470245128337652112878212941459329347",
                                        "12500085126843048684532885473768850586094133366876833840698567603558300429943",
                                        "8276253263131369565695687329790911140957927205765534740198480597854608202714",
                                        "14411459380456065006136894392078433460802915485975038137226267466736619639091",
                                        "7025653765868604607777943964159633546920168690664518432704587317074821855333").should.be.eventually.rejected("Pairing check failed");
          } catch (e) {
            isExceptionCaught = true;
          }
        });

        it("should not verify signatures with invalid counter", async() => {
            const isVerified = await skaleVerifier.verify("178325537405109593276798394634841698946852714038246117383766698579865918287",
                                                          "493565443574555904019191451171395204672818649274520396086461475162723833781",
                                                          "0x3733cd977ff8eb18b987357e22ced99f46097f31ecb239e878ae63760e83e4d5",
                                                          1,  // the counter should be 0
                                                          "3080491942974172654518861600747466851589809241462384879086673256057179400078",
                                                          "15163860114293529009901628456926790077787470245128337652112878212941459329347",
                                                          "12500085126843048684532885473768850586094133366876833840698567603558300429943",
                                                          "8276253263131369565695687329790911140957927205765534740198480597854608202714",
                                                          "14411459380456065006136894392078433460802915485975038137226267466736619639091",
                                                          "7025653765868604607777943964159633546920168690664518432704587317074821855333");

              assert(isVerified.should.be.false);
        });

        it("should not verify signatures with invalid hash", async() => {
            const isVerified = await skaleVerifier.verify("178325537405109593276798394634841698946852714038246117383766698579865918287",
                                                          "493565443574555904019191451171395204672818649274520396086461475162723833781",
                                                          "0x3733cd977ff8eb18b987357e22ced99f46097f31ecb239e878ae63760e83e4de",  // the last symbol is spoiled
                                                          0,
                                                          "3080491942974172654518861600747466851589809241462384879086673256057179400078",
                                                          "15163860114293529009901628456926790077787470245128337652112878212941459329347",
                                                          "12500085126843048684532885473768850586094133366876833840698567603558300429943",
                                                          "8276253263131369565695687329790911140957927205765534740198480597854608202714",
                                                          "14411459380456065006136894392078433460802915485975038137226267466736619639091",
                                                          "7025653765868604607777943964159633546920168690664518432704587317074821855333");

            assert(isVerified.should.be.false);
        });

        it("should not verify signatures with invalid common public key", async() => {
            let isExceptionCaught = false;
            try {
                await skaleVerifier.verify("178325537405109593276798394634841698946852714038246117383766698579865918287",
                                          "493565443574555904019191451171395204672818649274520396086461475162723833781",
                                          "0x3733cd977ff8eb18b987357e22ced99f46097f31ecb239e878ae63760e83e4d5",
                                          0,
                                          "3080491942974172654518861600747466851589809241462384879086673256057179400078",
                                          "15163860114293529009901628456926790077787470245128337652112878212941459329347",
                                          "12500085126843048684532885473768850586094133366876833840698567603558300429944",  // the last digit is spoiled
                                          "8276253263131369565695687329790911140957927205765534740198480597854608202714",
                                          "14411459380456065006136894392078433460802915485975038137226267466736619639091",
                                          "7025653765868604607777943964159633546920168690664518432704587317074821855333").should.be.eventually.rejected("Pairing check failed");
            } catch (e) {
              isExceptionCaught = true;
            }

            assert(isExceptionCaught.should.be.true);
        });

        it("should not verify signatures with invalid hash point", async() => {
            const isVerified = await skaleVerifier.verify("178325537405109593276798394634841698946852714038246117383766698579865918287",
                                                        "493565443574555904019191451171395204672818649274520396086461475162723833781",
                                                        "0x3733cd977ff8eb18b987357e22ced99f46097f31ecb239e878ae63760e83e4d5",
                                                        0,
                                                        "3080491942974172654518861600747466851589809241462384879086673256057179400078",
                                                        "15163860114293529009901628456926790077787470245128337652112878212941459329346",  // the last digit is spoiled
                                                        "12500085126843048684532885473768850586094133366876833840698567603558300429943",
                                                        "8276253263131369565695687329790911140957927205765534740198480597854608202714",
                                                        "14411459380456065006136894392078433460802915485975038137226267466736619639091",
                                                        "7025653765868604607777943964159633546920168690664518432704587317074821855333");

            assert(isVerified.should.be.false);
        });
      });
});
