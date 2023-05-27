/**
 * @jest-environment jsdom
 */

import { ROUTES_PATH } from '../constants/routes.js'

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then form elements should be rendered", () => {
      // Setup
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Assert
      const form = document.querySelector(`form[data-testid="form-new-bill"]`);
      const fileInput = document.querySelector(`input[data-testid="file"]`);
      const expenseTypeSelect = document.querySelector(`select[data-testid="expense-type"]`);
      const expenseNameInput = document.querySelector(`input[data-testid="expense-name"]`);
      const amountInput = document.querySelector(`input[data-testid="amount"]`);
      const datepickerInput = document.querySelector(`input[data-testid="datepicker"]`);
      const vatInput = document.querySelector(`input[data-testid="vat"]`);
      const pctInput = document.querySelector(`input[data-testid="pct"]`);
      const commentaryTextarea = document.querySelector(`textarea[data-testid="commentary"]`);

      expect(form).toBeTruthy();
      expect(fileInput).toBeTruthy();
      expect(expenseTypeSelect).toBeTruthy();
      expect(expenseNameInput).toBeTruthy();
      expect(amountInput).toBeTruthy();
      expect(datepickerInput).toBeTruthy();
      expect(vatInput).toBeTruthy();
      expect(pctInput).toBeTruthy();
      expect(commentaryTextarea).toBeTruthy();
    });
    describe("When I upload a file", () => {
      let newBillInstance;
      let createMock;

      beforeEach(() => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "test@employee.com" })
        );
        createMock = jest.fn().mockResolvedValue({ fileUrl: "https://example.com", key: "1234" });
        const storeMock = {
          bills: jest.fn().mockReturnValue({
            create: createMock,
          }),
        };

        newBillInstance = new NewBill({
          document,
          onNavigate: jest.fn(),
          store: storeMock,
          localStorage: window.localStorage,
        });
      });

      afterEach(() => {
        window.localStorage.clear();
      });

      test("with valid extension, it should call create method", () => {
        const fileInput = document.querySelector(`input[data-testid="file"]`);
        const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
        const event = {
          target: {
            value: "C:\\fakepath\\test.jpg",
            files: [file],
          },
          preventDefault: jest.fn(),
        };
        newBillInstance.handleChangeFile(event);

        expect(createMock).toHaveBeenCalled();
      });

      test("with invalid extension, it should not call create method and clear the input value", () => {
        const fileInput = document.querySelector(`input[data-testid="file"]`);
        const file = new File(["content"], "test.txt", { type: "text/plain" });
        const event = {
          target: {
            value: "C:\\fakepath\\test.txt",
            files: [file],
          },
          preventDefault: jest.fn(),
        };
        newBillInstance.handleChangeFile(event);

        expect(createMock).not.toHaveBeenCalled();
        expect(fileInput.value).toBe("");
      });
    });

  });
});

describe("When I submit the form", () => {
  test("Then it should call updateBill method and navigate to Bills page", () => {
    // Setup
    const html = NewBillUI();
    document.body.innerHTML = html;
    const onNavigateMock = jest.fn();
    const updateMock = jest.fn().mockResolvedValue({});
    const storeMock = {
      bills: jest.fn().mockReturnValue({
        update: updateMock,
      }),
    };
    window.localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "test@employee.com" })
    );
    const newBillInstance = new NewBill({
      document,
      onNavigate: onNavigateMock,
      store: storeMock,
      localStorage: window.localStorage,
    });

    // Act
    const form = document.querySelector(`form[data-testid="form-new-bill"]`);
    const event = {
      preventDefault: jest.fn(),
      target: {
        querySelector: jest.fn().mockReturnValue({
          value: "value",
        }),
      },
    };
    newBillInstance.handleSubmit(event);

    // Assert
    expect(updateMock).toHaveBeenCalled();
    expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
  });

  test("Then it should console log the error", () => {
    console.error = jest.fn();

    const errorMock = new Error('an error occurred');
    const updateMock = jest.fn().mockRejectedValue(errorMock);
    const storeMock = {
      bills: jest.fn().mockReturnValue({
        update: updateMock,
      }),
    };

    const newBillInstance = new NewBill({
      document,
      onNavigate: jest.fn(),
      store: storeMock,
      localStorage: window.localStorage,
    });

    const form = document.querySelector(`form[data-testid="form-new-bill"]`);
    const event = { preventDefault: jest.fn(), target: form };

    // Use a Promise to handle the asynchronous nature of the function
    return Promise.resolve(newBillInstance.handleSubmit(event))
      .then(() => {
        // the promise was resolved, don't expect this to happen in this test
        return Promise.reject(new Error('Promise should not resolve in this test'));
      })
      .catch(() => {
        // the promise was rejected, check if console.error was called
        expect(console.error).toHaveBeenCalledWith(errorMock);
      });
  });
});
