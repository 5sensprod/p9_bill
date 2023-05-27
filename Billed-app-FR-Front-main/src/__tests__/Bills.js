/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import Bills from '../containers/Bills.js';

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      //Verifier que la classe active-icon est bien présente
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy() // ajout de l'expression expect

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dateElements = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
      const dates = dateElements.map(a => new Date(a.innerHTML).toISOString())
      const antiChrono = (a, b) => b - a
      const datesCopy = JSON.parse(JSON.stringify(dates));
      const datesSorted = datesCopy.sort(antiChrono);
      expect(dates).toEqual(datesSorted)
    })

    // Ajout tests unitaires
    test("When I click on the 'Nouvelle note de frais' button, I should be redirected to the 'Nouvelle note de frais' page", async () => {
      // Set up
      const onNavigate = jest.fn();
      document.body.innerHTML = BillsUI({ data: [] });
      const root = document.getElementById("root");
      const billPage = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      const buttonNewBill = screen.getByTestId("btn-new-bill");

      // Action
      buttonNewBill.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      // Assert
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
    })

    test("should open the modal and display the bill image", () => {
      // Set up
      document.body.innerHTML = `<div id="modaleFile">
                                     <div class="modal-body"></div>
                                   </div>`;
      const icon = document.createElement("i");
      icon.setAttribute("data-bill-url", "https://example.com/bill.png");

      // Mock jQuery and modal function
      const modalMock = jest.fn();
      global.$ = jest.fn((selector) => {
        const element = document.querySelector(selector);
        return {
          width: () => 50,
          find: (innerSelector) => {
            const innerElement = element.querySelector(innerSelector);
            return {
              html: (content) => {
                if (content) {
                  innerElement.innerHTML = content;
                }
              },
            };
          },
          hasClass: () => true,
          modal: modalMock,
          click: jest.fn(),
        };
      });

      const billsPage = new Bills({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage,
      });

      // Action
      billsPage.handleClickIconEye(icon);

      // Assert
      const modalBody = document.querySelector(".modal-body");
      expect(modalBody.innerHTML).toContain(
        `<img width="25" src="https://example.com/bill.png" alt="Bill">`
      );
      expect(modalMock).toHaveBeenCalledWith('show');
    });

    test("Then eye icons should have 'click' event listener", () => {
      const mockElement = {
        addEventListener: jest.fn(),
        getAttribute: jest.fn().mockReturnValue("https://example.com/bill.png"),
      };
      document.querySelectorAll = jest.fn().mockReturnValue([mockElement]);

      const billPage = new Bills({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage,
      });

      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

  })
})
