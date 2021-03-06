import { InMemoryMongodbConnector } from "../utils/in-memory-mongodb";
import { UserModel } from "../../src/model/user-model";
import { TestUtils } from "../utils/test-utils";
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("User", () => {
  beforeEach(async () => {
    await InMemoryMongodbConnector.start();
  });

  afterEach(async () => {
    await InMemoryMongodbConnector.stop();
  });

  it("should be able to create a new user", async () => {
    const user = await UserModel.createUser(TestUtils.randomString(TestUtils.randomNumber()));
    const userFromDb = await UserModel.findById(user._id);
    expect(userFromDb).to.not.be.null;
  });

  it("should fail creating a new user if chatId is not unique", async () => {
    const chatId = TestUtils.randomString(TestUtils.randomNumber());
    const user = await UserModel.createUser(chatId);
    await expect(UserModel.createUser(chatId)).to.be.rejectedWith(Error);

    const users = await UserModel.find({});
    expect(users.length).to.equal(1);
    expect(users[0]._id.toString()).to.equal(user._id.toString());
  });

  it("should be able to find a user by chatId", async () => {
    const user = await UserModel.createUser(TestUtils.randomString(TestUtils.randomNumber()));
    const userFromDb = await UserModel.findByChatId(user.chatId);
    expect(userFromDb).to.not.be.null;
  });

  describe("Address", () => {
    it("should be able to add an address to a user", async () => {
      const user = await UserModel.createUser(TestUtils.randomString(TestUtils.randomNumber()));
      await user.addAddress(TestUtils.randomString(TestUtils.randomNumber()), [
        TestUtils.randomNumber(),
        TestUtils.randomNumber(),
      ]);

      const userFromDb = await UserModel.findByChatId(user.chatId);
      expect(userFromDb!!.addresses.length).to.equal(1);
      expect(userFromDb!!.addresses[0].addressId).to.equal(user.addresses[0].addressId);
      expect(userFromDb!!.addresses[0].geo.type).to.be.equal(user.addresses[0].geo.type);
      expect(userFromDb!!.addresses[0].geo.coordinates).to.have.ordered.members(user.addresses[0].geo.coordinates);
    });

    it("should fail adding an address to a user if the address already exists", async () => {
      const user = await UserModel.createUser(TestUtils.randomString(TestUtils.randomNumber()));
      const addressId = TestUtils.randomString(TestUtils.randomNumber());
      const coordinates: [number, number] = [TestUtils.randomNumber(), TestUtils.randomNumber()];

      await user.addAddress(addressId, coordinates);
      await expect(user.addAddress(addressId, coordinates)).to.be.rejectedWith(Error);

      const userFromDb = await UserModel.findByChatId(user.chatId);
      expect(userFromDb!!.addresses.length).to.equal(1);
    });
  });
});
